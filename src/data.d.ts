export interface UserType {
  id: string;
  pfp_url: string;
  name: string;
  handle: string;
}

export interface MessageType {
  id: string;
  sender: UserType;
  content: string;
}

export interface ChatType {
  id: string;  
  type: "dm" | "group";
  messages: MessageType[];
  inputBuffer: string;  
}

export interface GroupType extends ChatType {
  type: "group",
  name: string;
  description: string;
  members: UserType[];
}

export interface DMType extends ChatType {
  type: "dm",
  contact: UserType
}