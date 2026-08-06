import { useEffect, useState } from "react";
import {
  getArticle,
  generateDebate,
} from "./mock/mockAPI.jsx";
import MessageList from "./components/MessageList.jsx";
import "./App.css";
import Navigator from "./components/Navigator/Navigator.jsx";

export default function Debate() {
  const [showChat, setShowChat] = useState(true);

  const [article, setArticle] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(true);

  const [debate, setDebate] = useState(null);
  const [debateError, setDebateError] = useState("");

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoadingArticle(true);
        setDebateError("");

        const [articleResponse, debateResponse] =
          await Promise.all([
            getArticle(),
            generateDebate(),
          ]);

        setArticle(articleResponse);
        setDebate(debateResponse);
      } catch (error) {
        console.error(error);

        setArticle(null);
        setDebate(null);

        setDebateError(
          error.message ||
            "記事または議論の読み込みに失敗しました。",
        );
      } finally {
        setLoadingArticle(false);
      }
    };

    loadPageData();
  }, []);

  const agents = debate?.agents ?? [];
  const messages = debate?.messages ?? [];

  const supportAgents = agents.filter(
    (agent) =>
      agent.stance === "support" ||
      agent.side === "left",
  );

  const opposeAgents = agents.filter(
    (agent) =>
      agent.stance === "oppose" ||
      agent.side === "right",
  );

  return (
    <>
      <Navigator />

      <div className="debate-page">
        <div className="debate-body">
          <div className="control-bar">
            <button
              type="button"
              onClick={() =>
                setShowChat((current) => !current)
              }
              title={
                showChat
                  ? "議論パネルを隠す"
                  : "議論パネルを表示"
              }
            >
              {showChat
                ? "議論パネルを隠す"
                : "議論パネルを表示"}
            </button>
          </div>

          {debateError && (
            <div className="debate-error">
              Error: {debateError}
            </div>
          )}

          <div
            className={`debate-container ${
              showChat ? "split" : "single"
            }`}
          >
            {/* Article panel */}
            <section className="panel">
              <div className="panel-header">
                <strong>ニュース記事</strong>
              </div>

              <div className="panel-body">
                {loadingArticle && (
                  <div>Loading article...</div>
                )}

                {!loadingArticle && !article && (
                  <div className="empty-state">
                    Article not found.
                  </div>
                )}

                {article && (
                  <>
                    <h3 className="article-title">
                      {article.title}
                    </h3>

                    <div className="meta">
                      {article.source}

                      {article.topic &&
                        ` • ${article.topic}`}

                      {article.date &&
                        ` • ${new Date(
                          article.date,
                        ).toLocaleDateString()}`}
                    </div>

                    <div
                      className="article-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          article.contentHtml ||
                          "<p>(No content)</p>",
                      }}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Debate panel */}
            {showChat && (
              <section className="panel">
                <div className="panel-header">
                  <strong>議論パネル</strong>
                </div>

                <div className="panel-body">
                  {!debate ? (
                    <div className="empty-state">
                      議論を読み込んでいます...
                    </div>
                  ) : (
                    <>
                      <div className="topic-header">
                        <span className="topic-label">
                          話題:
                        </span>{" "}
                        <span className="topic-name">
                          {article?.topic}
                        </span>
                      </div>

                      <div className="team-columns">
                        <div>
                          <div className="team-title">
                            賛成派
                          </div>

                          <div className="team">
                            {supportAgents.map(
                              (agent, index) => (
                                <div
                                  key={`support-${agent.name}-${index}`}
                                  className="agent-badge support"
                                >
                                  {agent.name}
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="team-title right">
                            反対派
                          </div>

                          <div className="team right">
                            {opposeAgents.map(
                              (agent, index) => (
                                <div
                                  key={`oppose-${agent.name}-${index}`}
                                  className="agent-badge oppose"
                                >
                                  {agent.name}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="chat-divider" />

                      <MessageList
                        agents={agents}
                        messages={messages}
                      />
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}