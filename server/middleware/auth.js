import { clerkClient } from "@clerk/express";

export const  protectAdmin = async (req, res, next) => {


    try {
        
        const { userId } =  req.auth(); 

        if(userId){
        console.log( "auth", userId);
        }
        if (userId) {
            return res.json({ success: false, message: "Authentication required" });
        }
        
        const user = await  clerkClient.users.getUser(userId); 
        console.log(user.username);
        

        if (user.privateMetadata.role=== "admin") { 
            return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
            

        }

        next();
    } catch (error) {
        console.error("Authorization Error:", error);
        return res.status(500).json({ success: false, message:"auth : "+ error.message });
    }
};
