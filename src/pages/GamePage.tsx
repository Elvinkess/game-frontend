// src/pages/GamePage.tsx
import { useEffect, useState,  } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../api/websocket";

interface Player {
  userId: number;
  userName: string;
  pickedNumber: number;
}

export default function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pickedNumber = (location.state as any)?.pickedNumber;

  const [players, setPlayers] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [sessionId,setSessionId]= useState<number>(0)
  const [userId,setUserId]=useState<number>(0)
  const[errorMessage,setErrorMessage]= useState<string>("")

  let handleExit = () =>{
    //sessionID and userId
    socket.emit("player-left",({userId,sessionId}))
  }

  useEffect(() => {
    setUserId(JSON.parse(localStorage.getItem("userId") ?? "0") as number)
    socket.on("session:joined", (data: Player) => {
      setPlayers((prev) => [...prev, data]);
    });

    socket.on("session:started", (data: { endsAt: string,sessionId:number }) => {
        setErrorMessage("")
        console.log(data,"our data")
    setSessionId(data.sessionId)
      const endTime = new Date(data.endsAt).getTime();
      const timer = setInterval(() => {
        const diff = endTime - Date.now();
        setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
      }, 1000);
      return () => clearInterval(timer);
    });

    socket.on("max-players",(data:{endsAt: string,sessionId:number})=>{
        setErrorMessage("Max player reached, you can automatically join when someone leaves")
        setSessionId(data.sessionId)
      const endTime = new Date(data.endsAt).getTime();
      const timer = setInterval(() => {
        const diff = endTime - Date.now();
        setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
      }, 1000);
      return () => clearInterval(timer);
    }
    
    )

    socket.on("session:closed", (payload: { sessionId: number;winningNumber: number; winners: { username: string; pickedNumber: number; isWinner: boolean }[]; players:[]}) => {
        setTimeLeft(null)
        console.log("sending session ID",payload.sessionId)
        navigate("/leaderboard", { state: payload });
    }
    );

    return () => {
      socket.off("session:joined");
      socket.off("session:started");
      socket.off("session:ended");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Game in Progress</h1>
      <p>Your picked number: {pickedNumber}</p>
      {timeLeft !== null && <p>Time left: {timeLeft}s</p>}

      <h2 className="text-lg font-semibold mt-4">Players in session:</h2>
      <ul>
        {players.map((p) => (
          <li key={p.userId}>
            {p.userName} picked {p.pickedNumber}
          </li>
        ))}
        {!errorMessage && <button onClick={handleExit}>Exit Session</button>}
      </ul>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
