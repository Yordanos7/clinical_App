import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function VideoRoom() {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      });

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    socket.emit("join-room", roomId);

    socket.on("other-user", (userId) => {
      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit("offer", { offer, to: userId });
      });
    });

    socket.on("offer", ({ offer, from }) => {
      pc.setRemoteDescription(new RTCSessionDescription(offer));
      pc.createAnswer().then((answer) => {
        pc.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      });
    });

    socket.on("answer", ({ answer }) => {
      pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", ({ candidate }) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: roomId,
        });
      }
    };

    return () => {
      socket.disconnect();
      pc.close();
    };
  }, [roomId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full h-full rounded-lg"
        />
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-lg border-2 border-white"
        />
      </div>
    </div>
  );
}
