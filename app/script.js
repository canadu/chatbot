
// 1. fetchを使用してsetting.jsonファイルからデータを取得するPromiseを生成
const fetchDataPromise = fetch('./setting.json')
  .then(response => {
    // 2. サーバーレスポンスが成功したかどうかを確認
    if (!response.ok) {
      throw new Error("error");
    }
    // 3. JSONデータを取得して解析し、次のPromiseに渡す
    return response.json();
  })
  // 4. エラーが発生した場合の処理
  .catch(error => {
    console.error("Fetch failed:", error);
  });

// 5. setting.jsonから取得したデータを利用する
fetchDataPromise.then(data => {

  // 6. チャットボックスの要素を取得
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");

  // 7. ユーザーメッセージやAPIキーなどを格納する変数を初期化
  let userMessage = null;
  const API_KEY = data["key"];
  const API_MODEL = data["model"];
  const API_ROLE = data["role"];
  const API_CONTENT = data["content"];

  // 8. チャット入力欄の初期の高さを保存
  const inputInitHeight = chatInput.scrollHeight;

  // 9. チャットメッセージのli要素を生成する関数
  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    //クラス名に応じて、ロボットのアイコンを表示する
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="fa-solid fa-robot fa-lg"></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
  }

  // 10.OpenAI APIにリクエストを送り、応答を生成する関数
  const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    //APIから取得した応答を表示するための要素
    const messageElement = chatElement.querySelector("p");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: `${API_MODEL}`,
        messages: [
          { role: `${API_ROLE}`, content: `${API_CONTENT}` }, //chatbotに役割を与える
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
      })
    }
    // 11. APIにリクエストを送信して、応答を処理
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
      messageElement.textContent = data.choices[0].message.content.trim();
    }).catch(error => {
      // 12. エラーが発生した場合の処理
      messageElement.classList.add("error");
      messageElement.textContent = "エラーが発生しました。 お手数ですが、もう一度お試しください";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  }

  // 13. ユーザーがメッセージを送信した時の処理
  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // 14. 送信したメッセージを表示
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // 15. 一定時間後に応答待ちのメッセージを表示し、応答を生成
    setTimeout(() => {
      const incomingChatLi = createChatLi("応答を待っています。...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);
  }

  // 16. チャット入力欄の高さ調整
  chatInput.addEventListener("input", () => {
    //入力テキストエリアの高さを調整する
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  // 17. Enterキーが押された時の処理
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleChat();
    }
  });

  // 18. 送信ボタンがクリックされた時の処理
  sendChatBtn.addEventListener("click", handleChat);

  // 19. 閉じるボタンがクリックされた時の処理
  closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

  // 20. チャットボット表示トグルボタンがクリックされた時の処理
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

});