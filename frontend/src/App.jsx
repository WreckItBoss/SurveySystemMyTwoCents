/*
 * SESSION TIMEOUT
 *
 * The backend provides expiresAt when the
 * session is created.
 *
 * Once the expiration time is reached:
 * - tell backend to expire the session
 * - backend releases reservedCount
 * - clear the local assignment
 * - clear questionnaire answers
 * - return to Consent
 * - show a timeout message
 */
useEffect(() => {
  if (
    !assignment?.expiresAt ||
    completionCode
  ) {
    return;
  }

  const expiresAtTime =
    new Date(
      assignment.expiresAt,
    ).getTime();

  if (Number.isNaN(expiresAtTime)) {
    console.error(
      "Invalid session expiration time:",
      assignment.expiresAt,
    );

    return;
  }

  async function handleSessionTimeout() {
    /*
     * Keep the sessionId before clearing
     * the assignment from React/localStorage.
     */
    const expiredSessionId =
      assignment.sessionId;

    /*
     * Tell the backend that this session
     * has expired.
     *
     * The backend changes:
     * active -> expired
     *
     * and releases reservedCount.
     */
    try {
      const response = await fetch(
        `${API_URL}/api/sessions/${expiredSessionId}/expire`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        console.error(
          "Failed to expire session:",
          response.status,
        );
      } else {
        const result =
          await response.json();

        console.log(
          "Session expiration result:",
          result,
        );
      }
    } catch (error) {
      /*
       * Even if the request fails because of
       * network problems, reset the frontend.
       *
       * The backend's releaseExpiredSessions()
       * remains the fallback and will release
       * this reservation later.
       */
      console.error(
        "Failed to notify backend of timeout:",
        error,
      );
    }

    /*
     * Reset React state.
     */
    setAssignment(null);
    setResponses(initialResponses);
    setCurrentPageIndex(0);
    setStartedAt("");
    setCompletionCode("");
    setSubmitError("");
    setAssignmentError("");

    /*
     * Inform participant.
     */
    setTimeoutMessage(
      "回答時間の上限（40分）を超えたため、セッションが終了しました。参加を希望される場合は、再度内容をご確認のうえ「同意して次へ」を押してください。",
    );

    /*
     * Clear old local session.
     */
    localStorage.removeItem(
      "mtcAssignment",
    );

    localStorage.removeItem(
      "mtcResponses",
    );

    localStorage.removeItem(
      "mtcCurrentPage",
    );

    localStorage.removeItem(
      "mtcStartedAt",
    );

    localStorage.removeItem(
      "mtcCompletionCode",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const remainingTime =
    expiresAtTime - Date.now();

  /*
   * Also handles reopening the website
   * after the session already expired.
   */
  if (remainingTime <= 0) {
    handleSessionTimeout();
    return;
  }

  const timeoutId =
    window.setTimeout(
      handleSessionTimeout,
      remainingTime,
    );

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [assignment, completionCode]);