import { useEffect, useState } from "react";
import api from "../api/client";
import socket from "../api/websocket";
import { useLocation } from "react-router-dom";
import "../utils/styles.css"


interface PlayerNames{
  username:string
}

interface Payload {
  sessionId: number;
  winningNumber: number;
  winners:PlayerNames [];
  players: any[]; // refine type if you know it
}

const getAllActivePlayersInSession = async (sessionId:number):Promise<PlayerNames[]> => {
  try {
    const { data } = await api.get(`session_players/active_players/${sessionId}`);
    console.log(data,"active players in session from getAllActivePlayer")
    return data 
  } catch (error) {
    console.error("Error fetching players:", error);
    return []
  }
};

export default function LeaderboardPage() {

  const location = useLocation();
  // const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const[activePlayers,setActivePlayers] = useState<PlayerNames[]>([]) //player in each session
  const { sessionId, winningNumber, winners } = location.state as Payload;
  console.log(sessionId,"session ID")

  
 
  if (!sessionId) {
    return <p>No session ID found.</p>;
  }


  useEffect(() => {
    // Initial fetch

    const fetchPlayers = async () => {
      const players = await getAllActivePlayersInSession(sessionId);
      setActivePlayers(players)
    };

    fetchPlayers();
    return () => {
      socket.off("session:closed");
    };
  }, []);

 

  return (
    <div className="p-6">
      <div className="main_section">

        {/*Display players in session*/}
        <div>
          <h2 className="Player_session">Active Players in Session</h2>
          <ul className="space-y-2">
            {activePlayers.map((p, i) => (
              <li key={i} >
                <span>{p.username  }</span>
              </li>
            ))}
          </ul>
        </div>
       

        <div>
          <span>RESULT</span>
          <h3>{winningNumber}</h3>
          <p>Total Players: {activePlayers.length}</p>
          <p>Total wins: {winners.length}</p>
        </div>

        {/*Display winners in session*/}
        <div className="Winners">
          <h2 className="winner-board">Winners:</h2>
          {winners.length > 0 ? (
            <ul>
              {winners.map((w, i) => (
                <li key={i}>{w.username}</li>
              ))}
            </ul>
          ) : (
            <p>No winners this round</p>
          )}
        </div>
      </div>
      
        
    {/* Display Top players once clicked */}
      {/* <button onClick={fetchLeaderboard}>Get Top Players</button> */}

      {/* {topPlayers.length > 0 && (
        <ul className="space-y-2">
          {topPlayers.map((p, i) => (
            <li key={i} className="flex justify-between border p-2 rounded">
              <span>{p.username}</span>
              <span>{p.wins} wins</span>
            </li>
          ))}
        </ul>
      )} */}


    </div>
  );
}





   
    