import "./MessageList.css";

function TypingDots() {
  return (
    <span className="typing-dots" aria-label="Thinking">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function MessageList({
  agents = [],
  messages = [],
  status = null,
}) {
  const getAgentByIndex = (index) => {
    return agents[index] || null;
  };

  const getStance = ({ stance, side, agent }) => {
    if (stance === "support" || stance === "oppose") {
      return stance;
    }

    if (agent?.stance === "support" || agent?.stance === "oppose") {
      return agent.stance;
    }

    if (side === "right" || agent?.side === "right") {
      return "oppose";
    }

    return "support";
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const agent =
          typeof message.agentIndex === "number"
            ? getAgentByIndex(message.agentIndex)
            : null;

        const stance = getStance({
          stance: message.stance,
          side: message.side,
          agent,
        });

        return (
          <div
            key={`${message.speaker || "agent"}-${index}`}
            className={`message-bubble ${stance}`}
          >
            <div className="message-text">
              {message.text}
            </div>
          </div>
        );
      })}

      {status?.type === "system" && (
        <div className="system-status">
          {status.text}
        </div>
      )}

      {status?.type === "agent" && (
        <div
          className={`message-bubble thinking-bubble ${
            status.stance === "oppose" ||
            status.side === "right"
              ? "oppose"
              : "support"
          }`}
        >
          <div className="thinking-content">
            <span>
              <strong>{status.speaker || "Agent"}</strong>{" "}
              が考え中
            </span>

            <TypingDots />
          </div>
        </div>
      )}
    </div>
  );
}