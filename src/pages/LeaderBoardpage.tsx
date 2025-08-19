import { useEffect, useState } from "react";
import api from "../api/client";
import socket from "../api/websocket";

interface Player {
  username: string;
  wins: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch top 10 players from backend
  const fetchLeaderboard = async () => {
    const { data } = await api.get("/user/top-players");
    setPlayers(data);
  };

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();

    // Listen for session winners
    socket.on(
      "session:closed",
      (payload: {
        sessionId: number;
        winningNumber: number;
        winners: { username: string; pickedNumber: number; isWinner: boolean }[];
        players:[]
      }) => {
        console.log(payload.players,"these are the players")
        console.log(payload)

        const winnersFromPayload = payload.winners.map((w) => ({
          username: w.username,
          wins: 1, // optionally you can merge with actual wins if available
        }));

        // Merge winners with existing leaderboard
        setPlayers((prev) => {
          const updatedMap: Record<string, Player> = {};

          // Add existing players
          prev.forEach((p) => {
            updatedMap[p.username] = { ...p };
          });

          // Add or update winners
          winnersFromPayload.forEach((w) => {
            if (updatedMap[w.username]) {
              updatedMap[w.username].wins += w.wins; // increment wins
            } else {
              updatedMap[w.username] = { ...w };
            }
          });

          // Convert map back to sorted array by wins descending
          return Object.values(updatedMap).sort((a, b) => b.wins - a.wins).slice(0, 10);
        });
      }
    );

    return () => {
      socket.off("session:closed");
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <ul className="space-y-2">
        {players.map((p, i) => (
          <li key={i} className="flex justify-between border p-2 rounded">
            <span>{p.username}</span>
            <span>{p.wins} wins</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
