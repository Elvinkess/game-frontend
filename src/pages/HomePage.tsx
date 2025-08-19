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
    let timer: NodeJS.Timeout;
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

return (
        // Main container for the whole page to set background and flex properties
        // Bootstrap equivalent: d-flex (display: flex), flex-column (flex-direction: column),
        // min-vh-100 (min-height: 100vh), bg-light-subtle (a light gray background)
        <div className="d-flex flex-column min-vh-100 bg-light-subtle position-relative">
            {/* "Hi Jane" positioned absolutely in the top right corner */}
            {/* Bootstrap equivalent: position-absolute, top-0, end-0 (right-0), pt-4, pe-4 (padding top/end) */}
            <div className="position-absolute top-0 end-0 p-4 fs-4 fw-bold">
                Hi {user?.username}
            </div>

            {/* Central container for wins/losses, button, and messages */}
            {/* Bootstrap equivalent: flex-grow-1, d-flex, flex-column, align-items-center, justify-content-center */}
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <p className="fs-5">Total Wins: {user?.wins ?? 0}</p>
                <p className="fs-5 mb-5">Total Loses: {user?.losses ?? 0}</p>

                {/* Number picker (commented out as per your original code) */}
                {/* <input
                    type="number"
                    min={1}
                    max={9}
                    value={pickedNumber ?? ""}
                    onChange={(e) => setPickedNumber(Number(e.target.value))}
                    className="form-control text-center w-auto mb-4" // Bootstrap classes for input
                    style={{ width: '6rem' }} // Custom width if needed
                    placeholder="Pick 1-9"
                /> */}

                {/* JOIN button styled to match the large black rectangle */}
                {/* Bootstrap equivalent: btn, btn-dark (black background), fw-bold (font bold),
                    py-5 (large vertical padding), px-5 (horizontal padding),
                    rounded-3 (more rounded corners), shadow (adds shadow) */}
                <button
                    onClick={joinSession}
                    className="btn btn-dark fw-bold py-5 px-5 fs-4 rounded-3 shadow"
                    style={{ minWidth: '15rem' }} // Ensure it's wide enough
                >
                    JOIN
                </button>

                {/* Conditional rendering for session message */}
                {/* Bootstrap equivalent: mt-5 (margin top), text-danger (red text), fs-5 (font size) */}
                {timeLeft !== null ? (
                    <p className="mt-5 text-danger fs-5">There is an active session, you can join in : {timeLeft}s</p>
                ) : (
                    <p className="mt-5 text-secondary fs-5">No active session</p>
                )}
                
                {/* General message display */}
                {/* Bootstrap equivalent: mt-4 (margin top) */}
                {message && <p className="mt-4 text-secondary">{message}</p>}
            </div>
        </div>
    );
                    </>
                }
                
            </div>
  );
}


{/* Number picker */}
            {/* <input
            type="number"
            min={1}
            max={9}
            value={pickedNumber ?? ""}
            onChange={(e) => setPickedNumber(Number(e.target.value))}
            className="border p-2 rounded text-center w-24"
            placeholder="Pick 1-9"
            /> */}