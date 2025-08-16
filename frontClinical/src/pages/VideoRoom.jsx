import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../services/socketService";
import { useAuth } from "../context/AuthContext";

export default function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const createPeerConnection = (socketID) => {
      const pc = new RTCPeerConnection();

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStreamRef.current));
      }

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [socketID]: event.streams[0],
        }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: socketID,
          });
        }
      };

      peerConnections.current[socketID] = pc;
      return pc;
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;

        socket.emit("join-room", {
          roomId,
          userId: user.id,
          role: user.role,
        });

        socket.on("all-users", (allUsers) => {
          allUsers.forEach((user) => {
            if (user.id !== socket.id) {
              const pc = createPeerConnection(user.id);
              // The user with the lower ID will initiate the offer
              if (socket.id < user.id) {
                pc.createOffer().then((offer) => {
                  pc.setLocalDescription(offer);
                  socket.emit("offer", { offer, to: user.id });
                });
              }
            }
          });
        });
      });

    // Received an offer, create an answer
    socket.on("offer", ({ offer, from }) => {
      const pc = peerConnections.current[from] || createPeerConnection(from);
      pc.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => pc.createAnswer())
        .then((answer) => {
          return pc.setLocalDescription(answer).then(() => answer);
        })
        .then((answer) => {
          socket.emit("answer", { answer, to: from });
        });
    });

    socket.on("answer", ({ answer, from }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("user-left", (userId) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });

    return () => {
      // Clean up all socket listeners
      socket.off("all-users");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");

      // Leave the room
      socket.emit("leave-room", { roomId });

      // Stop all local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
    };
  }, [roomId, user]);

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    socket.emit("leave-room", { roomId });
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    navigate("/appointments");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full rounded-lg"
          />
          {Object.entries(remoteStreams).map(([socketId, stream]) => (
            <video
              key={socketId}
              autoPlay
              ref={(video) => {
                if (video) video.srcObject = stream;
              }}
              className="w-full h-full rounded-lg"
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-10">
        <button
          onClick={handleLeave}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
}
