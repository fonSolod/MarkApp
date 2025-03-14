import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint that mirrors the external API
  app.post("/api/auth", async (req, res) => {
    const { username, password } = req.body;

    try {
      // Forward the authentication request to the external API
      const response = await axios.post('https://l4.ihubzone.ru/api/auth/', {
        username,
        password
      });

      // If successful, store the user locally and return the token
      if (response.status === 200) {
        const token = response.data.token;

        // Store user in local storage if needed
        await storage.createUser({
          username,
          password: "external-auth" // We don't store the actual password
        });

        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error('Authentication error:', error.message);
      res.status(401).json({ 
        message: error.response?.data?.message || "Authentication failed" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}