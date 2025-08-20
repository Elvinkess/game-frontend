import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../api/websocket";
import { getUserIdFromToken } from "../utils/auth";
import api from "../api/client";
export interface IUser{
    username:string,
    wins:number,
    losses:number
}
export default function HomePage() {
  const [pickedNumber, setPickedNumber] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  const[user,setUser]= useState<IUser | null>(null)
 const [authError,setAuthError]= useState<string>("")


  const userId = getUserIdFromToken();
    const getUserdetails = async()=>{
        try {
            let res =await api.get<IUser>("/user/get_user",{headers:{"Authorization":`Bearer ${localStorage.getItem("token")}`}})
            setUser(res.data)
            console.log(res.data)
        } catch (error) {
            setAuthError("Pls sign in")
        }
    
    }
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    getUserdetails()
    // listen for active session
    socket.emit("get-active-session");


    //  Listen for session update (broadcast to all)
    socket.on(
      "session:update",
      (data: { sessionId: string; endsAt: string; duration: number }) => {
        console.log("Received session:update:", data);

        const endTime = new Date(data.endsAt).getTime();

        // clear any previous timers
        if (timer) clearInterval(timer);

        timer = setInterval(() => {
          const diff = endTime - Date.now();
          setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
        }, 1000);
      }
    );

    //  Listen for session end
    socket.on("session:ended", () => {
      setTimeLeft(null);
      if (timer) clearInterval(timer);
    });
    //  Listen for session started
    socket.on("session:started", (p:{sessionId:number,endsAt:Date,duration:number}) => {
        const endTime = new Date(p.endsAt).getTime();
      const timer = setInterval(() => {
        const diff = endTime - Date.now();
        setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
      }, 1000);
      return () => clearInterval(timer);
        
      });

    //  Error listener
    socket.on("session:error", (errMsg: string) => setMessage(`${errMsg}`));
    return () => {
      socket.off("session:update");
      socket.off("session:started");
      socket.off("session:ended");
      socket.off("session:error");
      if (timer) clearInterval(timer);
    };
  }, []);

  const joinSession = () => {
    if (!userId) {
      setMessage("You must be logged in");
      return;
    }
    localStorage.setItem("userId",JSON.stringify(userId))
    if (pickedNumber === null || pickedNumber < 1 || pickedNumber > 9) {
      setMessage("Please pick a number between 1-9");
      return;
    }

    // Emit the join-session event
    socket.emit("join-session", { userId, pickedNumber });
    
    //Navigate to GamePage
     navigate("/game", { state: { pickedNumber } });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
        {
            !user && authError ? <div>Pls authenticate and sign in <Link to="/login">Here</Link></div> :<>

       
        <div className="d-flex flex-column min-vh-100 bg-light-subtle position-relative">
            {/* Bootstrap equivalent: position-absolute, top-0, end-0 (right-0), pt-4, pe-4 (padding top/end) */}
            <div className="position-absolute top-0 end-0 p-4 fs-4 fw-bold">
                Hi {user?.username}
            </div>
              <div className="flex_homepage">
                <div className="flex-grow-1 d-flex flex-column mt-3 align-items-center justify-content-center">
                  <p className="fs-5">Total Wins: {user?.wins ?? 0}</p>
                  <p className="fs-5 mb-5">Total Loses: {user?.losses ?? 0}</p>

                  <input
                      type="number"
                      min={1}
                      max={9}
                      value={pickedNumber ?? ""}
                      onChange={(e) => setPickedNumber(Number(e.target.value))}
                      className="custom-number-input" 
                      placeholder="Pick 1-9"
                  />

                  <button
                      onClick={joinSession}
                      className="btn btn-dark fw-bold py-5 px-5 fs-4 rounded-3 shadow"
                      style={{ minWidth: '15rem' }} // Ensure it's wide enough
                  >JOIN</button>

                  {timeLeft !== null ? (
                      <p className="mt-5 text-danger fs-5">There is an active session, you can join in : {timeLeft}s</p>
                  ) : (
                      <p className="mt-5 text-secondary fs-5">No active session</p>
                  )}
                  
                  {message && <p className="mt-4 text-secondary">{message}</p>}
            </div>
              </div>
          
        </div>
    );
                    </>
                }
                
            </div>
  );
}


// Fetch top 10 players from backend
  // const fetchLeaderboard = async () => {
  //   const { data } = await api.get("/user/top-players");
  //   setTopPlayers(data);
  // };