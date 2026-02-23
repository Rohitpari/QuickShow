// Aise import karein
import { useUser } from "@clerk/clerk-react"; 

function UserProfile() {
  // useUser() hook ka istemal karein
  const { isLoaded, isSignedIn, user,clerkClient,privateMetadata } = useUser();

  // Jab tak data load na ho, loading state dikhayein
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Agar user logged in hai, to uski ID dikhayein
  if (isSignedIn) {
    console.log("Clerk User ID:", user.id);
    // console.log(user.privateMetadata.role);
    
     
    
    return (
      <div>
        <h1>Welcome, {user.firstName} {user.lastName}!</h1>
        <p>Your User ID is: <strong>{user.id} </strong></p>
        {/* <p>privatemetadat : {user.privateMetadata.role}</p> */}
      </div>
    );
  }

  // Agar user logged in nahi hai
  return (
    <div>
      <p>Please sign in to see your profile.</p>
    </div>
  );
}

export default UserProfile;