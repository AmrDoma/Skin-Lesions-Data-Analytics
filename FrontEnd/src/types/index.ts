export interface MessageType {
  id: string;
  text: string;
  sender_type: "user" | "ai";
  timestamp: any;
}
