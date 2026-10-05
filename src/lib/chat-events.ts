/** Dispatched by the sidebar's "Ask Ag" button and Ag's own menu. Lives here,
 *  not in chatbot.tsx, so importing it doesn't pull the whole chat into the page. */
export const OPEN_CHAT_EVENT = "ag:open-chat";

/** Dispatched by the chat as a reply goes, so Ag on the page can act it out. */
export const CHAT_STATE_EVENT = "ag:chat-state";

/** Where the latest reply is: being thought up, answered, answered with a
 *  nudge to message Ace, lost, or refused for asking too fast. */
export type ChatState = "thinking" | "answered" | "contact" | "failed" | "limited";

export const sendChatState = (state: ChatState) =>
  window.dispatchEvent(new CustomEvent<ChatState>(CHAT_STATE_EVENT, { detail: state }));

/** Dispatched by the chat's "Show me" with the element to show: Ag hops onto it. */
export const SHOW_EVENT = "ag:show";

export const showOnPage = (el: Element) => window.dispatchEvent(new CustomEvent<Element>(SHOW_EVENT, { detail: el }));
