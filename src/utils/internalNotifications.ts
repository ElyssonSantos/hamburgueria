interface NotificationOptions {
  title: string;
  message: string;
  iconUrl?: string;
  url?: string;
  durationMs?: number;
}

export function criarNotificacaoInterna({
  title,
  message,
  iconUrl,
  url,
  durationMs = 4200,
}: NotificationOptions) {
  // Tocar som de notificação
  const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OScTgwPUKfj8LZjHAU7k9n0yHYqBSh+zPLaizsKFV+16+mnVBMJSKDh8r5sIAUsgs/y2Ik1CBdmvOrjm08LDlCo5fG2YxsEPJTZ9Mh2KgUofszy2os7ChVftevpp1QTCUig4fK+bCAFLILP8tmJNQgXZr3q45tPCw5QqOXxtmMbBDyU2fTIdioFKH7M8tqLOwoVX7Xr6adUEwlIoOHyvmwgBSyCz/LZiTUIGGa96uObTwsOUKjl8bZjGwQ8lNn0yHYqBSh+zPLaizsKFV+16+mnVBMJSKDh8r5sIAUsgs/y2Yk1CBlmvOrjm08LDlCo5PG2YxsEPJTZ9Mh2KgUofszy2os7ChVftuvpp1QTCUig4fK+bCAFLILP8tmJNQgZZrzq45tPCw5QqOTxtmMbBDyU2fTIdioFKH7M8tqLOwoVX7br6adUEwlIoOHyvmwgBSyCz/LZiTUIGWa86uObTwsOUKjk8bZjGwQ8lNn0yHYqBSh+zPLaizsKFV+26+mnVBMJSKDh8r5sIAUsgs/y2Yk1CBlmvOrjm08LDlCo5PG2YxsEPJTZ9Mh2KgUofszy2os7ChVftuvpp1QTCUig4fK+bCAFLILP8tmJNQgZZrzq45tPCw5QqOTxtmMbBDyU2fTIdioFKH7M8tqLOwoVX7br6adUEwlIoOHyvmwgBSyCz/LZiTUIGWa86uObTwsOUKjk8bZjGwQ8lNn0yHYqBSh+zPLaizsKFV+26+mnVBMJSKDh8r5sIAUsgs/y2Yk1CBlmvOrjm08LDlCo5PG2YxsEPJTZ9Mh2KgUofszy2os7ChVftuvpp1QTCUig4fK+bCAFLILP8tmJNQgZZrzq45tPCw5QqOTxtmMbBDyU2fTIdioFKH7M8tqLOwoVX7br6adUEwlIoOHyvmwgBSyCz/LZiTUIGWa86uObTwsOUKjk8bZjGwQ8lNn0yHYqBSh+zPLaizsKFV+26+mnVBMJSKDh8r5sIAUsgs/y2Yk1CBlmvOrjm08LDlCo5PG2Yxr///8=");
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Ignora erros se o áudio não puder ser reproduzido

  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.className = "notification";

  notif.innerHTML = `
    <div class="icon">
      ${iconUrl ? `<img src="${iconUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" alt="notification icon" />` : "🔔"}
    </div>
    <div class="content">
      <div class="title">${title}</div>
      <div class="message">${message}</div>
    </div>
  `;

  if (url) {
    notif.style.cursor = "pointer";
    notif.onclick = () => window.open(url, "_blank");
  }

  container.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = "notifSlideOut .35s ease forwards";
    setTimeout(() => notif.remove(), 350);
  }, durationMs);
}
