// ===== COMPONENTES REUTILIZÁVEIS DO SISTEMA =====

// Header padrão do sistema
function createSystemHeader() {
    return `
        <header class="system-header">
            <div class="header-container">
                <a href="./portal.html" class="header-logo">
                    <div class="header-logo-icon">🚀</div>
                    <h1>LicitaEvolution</h1>
                </a>

                <nav class="header-nav">
                    <ul class="nav-links">
                        <li><a href="./dashboard-novo.html">Dashboard</a></li>
                        <li><a href="./editais-novo.html">Editais</a></li>
                        <li><a href="./components.html">Componentes</a></li>
                        <li><a href="./demo-frontend.html">Demo</a></li>
                        <li><a href="./portal.html">Portal</a></li>
                    </ul>

                    <div class="header-user">
                        <div class="user-avatar">A</div>
                        <div class="user-info">
                            <span class="user-name">Administrador</span>
                            <span class="user-role">Admin</span>
                        </div>
                    </div>

                    <div class="header-actions">
                        <button class="header-btn" onclick="openSettings()">⚙️ Configurações</button>
                        <button class="header-btn" onclick="logout()">🚪 Sair</button>
                    </div>
                </nav>
            </div>
        </header>
    `;
}

// Footer padrão do sistema
function createSystemFooter() {
    return `
        <footer class="system-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <h3>LicitaEvolution</h3>
                        <p>Sistema ERP completo para gestão inteligente de licitações públicas com IA especializada. Otimize seus processos e maximize suas oportunidades.</p>
                    </div>

                    <div class="footer-section">
                        <h4>Sistema</h4>
                        <ul class="footer-links">
                            <li><a href="/dashboard.html">Dashboard</a></li>
                            <li><a href="/editais.html">Editais</a></li>
                            <li><a href="/contratos.html">Contratos</a></li>
                            <li><a href="/financeiro.html">Financeiro</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4>Suporte</h4>
                        <ul class="footer-links">
                            <li><a href="/documentacao.html">Documentação</a></li>
                            <li><a href="/tutoriais.html">Tutoriais</a></li>
                            <li><a href="/suporte.html">Contato</a></li>
                            <li><a href="/status.html">Status do Sistema</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4>Empresa</h4>
                        <ul class="footer-links">
                            <li><a href="/sobre.html">Sobre Nós</a></li>
                            <li><a href="/privacidade.html">Privacidade</a></li>
                            <li><a href="/termos.html">Termos de Uso</a></li>
                            <li><a href="/seguranca.html">Segurança</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2024 LicitaEvolution. Todos os direitos reservados.</p>
                    <div class="footer-social">
                        <a href="#" class="social-link">📘</a>
                        <a href="#" class="social-link">📧</a>
                        <a href="#" class="social-link">💼</a>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// Chat flutuante LicitAI
function createClaudeChat() {
    return `
        <div class="claude-chat-widget">
            <button class="chat-toggle" onclick="toggleChat()">
                <span id="chat-icon">🤖</span>
                <div class="chat-notification hidden" id="chat-notification">1</div>
            </button>

            <div class="chat-container" id="chat-container">
                <div class="chat-header">
                    <div class="chat-avatar">🤖</div>
                    <div class="chat-info">
                        <h4>LicitAI</h4>
                        <div class="chat-status">
                            <div class="status-dot"></div>
                            <span>Online</span>
                        </div>
                    </div>
                    <button class="chat-close" onclick="toggleChat()">✕</button>
                </div>

                <div class="chat-messages" id="chat-messages">
                    <div class="message claude">
                        <div>Olá! Eu sou o LicitAI, seu assistente inteligente especializado em licitações. Como posso ajudá-lo hoje?</div>
                        <div class="message-time">Agora</div>
                    </div>
                </div>

                <div class="typing-indicator" id="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>

                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea
                            class="chat-input"
                            id="chat-input"
                            placeholder="Digite sua mensagem..."
                            rows="1"
                            onkeypress="handleKeyPress(event)"
                            oninput="autoResize(this)"
                        ></textarea>
                        <button class="chat-send" onclick="sendMessage()" id="send-button">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// CSS dos componentes
function getComponentsCSS() {
    return `
        /* ===== COMPONENTES DO SISTEMA ===== */

        /* Header */
        .system-header {
            background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, var(--secondary-color, #7c3aed) 100%);
            color: white;
            padding: 0;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 2rem;
        }

        .header-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: white;
        }

        .header-logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .header-logo h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
        }

        .header-nav {
            display: flex;
            align-items: center;
            gap: 2rem;
        }

        .nav-links {
            display: flex;
            gap: 1.5rem;
            list-style: none;
        }

        .nav-links a {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
        }

        .nav-links a:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }

        .nav-links a.active {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .header-user {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .user-role {
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .header-actions {
            display: flex;
            gap: 0.5rem;
        }

        .header-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .header-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Footer */
        .system-footer {
            background: var(--gray-900, #111827);
            color: white;
            margin-top: auto;
        }

        .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 3rem 2rem 2rem;
        }

        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
        }

        .footer-brand h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .footer-brand p {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
        }

        .footer-section h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .footer-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .footer-links a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.2s ease-in-out;
        }

        .footer-links a:hover {
            color: white;
        }

        .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba(255, 255, 255, 0.8);
        }

        .footer-social {
            display: flex;
            gap: 1rem;
        }

        .social-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            transition: all 0.2s ease-in-out;
        }

        .social-link:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Chat Flutuante */
        .claude-chat-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            font-family: inherit;
        }

        .chat-toggle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, var(--secondary-color, #7c3aed) 100%);
            border: none;
            color: white;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: all 0.2s ease-in-out;
            position: relative;
        }

        .chat-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .chat-toggle.active {
            transform: rotate(180deg);
        }

        .chat-notification {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: var(--error-color, #dc2626);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.75rem;
            font-weight: 600;
            border: 2px solid white;
        }

        .chat-container {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 380px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--gray-200, #e5e7eb);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-container.active {
            display: flex;
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .chat-header {
            background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, var(--secondary-color, #7c3aed) 100%);
            color: white;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }

        .chat-info h4 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
        }

        .chat-status {
            font-size: 0.8rem;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
        }

        .chat-close {
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
        }

        .chat-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message {
            max-width: 85%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            line-height: 1.4;
            font-size: 0.9rem;
        }

        .message.user {
            align-self: flex-end;
            background: var(--primary-color, #2563eb);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .message.claude {
            align-self: flex-start;
            background: var(--gray-50, #f9fafb);
            color: var(--gray-900, #111827);
            border-bottom-left-radius: 4px;
            border: 1px solid var(--gray-200, #e5e7eb);
        }

        .message-time {
            font-size: 0.7rem;
            opacity: 0.7;
            margin-top: 0.25rem;
        }

        .typing-indicator {
            align-self: flex-start;
            padding: 0.75rem 1rem;
            background: var(--gray-50, #f9fafb);
            border-radius: 12px;
            border-bottom-left-radius: 4px;
            display: none;
        }

        .typing-dots {
            display: flex;
            gap: 0.25rem;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--gray-500, #6b7280);
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.5;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }

        .chat-input-container {
            padding: 1rem;
            border-top: 1px solid var(--gray-200, #e5e7eb);
            background: white;
        }

        .chat-input-wrapper {
            display: flex;
            gap: 0.5rem;
            align-items: flex-end;
        }

        .chat-input {
            flex: 1;
            border: 1px solid var(--gray-200, #e5e7eb);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            resize: none;
            min-height: 44px;
            max-height: 120px;
            outline: none;
            transition: all 0.2s ease-in-out;
        }

        .chat-input:focus {
            border-color: var(--primary-color, #2563eb);
        }

        .chat-send {
            background: var(--primary-color, #2563eb);
            color: white;
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease-in-out;
        }

        .chat-send:hover:not(:disabled) {
            background: var(--primary-dark, #1d4ed8);
        }

        .chat-send:disabled {
            background: var(--gray-400, #9ca3af);
            cursor: not-allowed;
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .header-container {
                padding: 1rem;
                flex-wrap: wrap;
            }

            .nav-links {
                display: none;
            }

            .footer-content {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .footer-bottom {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .chat-container {
                width: calc(100vw - 48px);
                right: -12px;
            }

            .claude-chat-widget {
                right: 12px;
            }
        }

        /* Utilitários */
        .hidden {
            display: none !important;
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
    `;
}

// Funções JavaScript para o chat
function initializeClaudeChat() {
    let chatOpen = false;
    let messageHistory = [];

    // Função para alternar o chat
    window.toggleChat = function() {
        const container = document.getElementById('chat-container');
        const toggle = document.querySelector('.chat-toggle');
        const notification = document.getElementById('chat-notification');

        chatOpen = !chatOpen;

        if (chatOpen) {
            container.classList.add('active');
            toggle.classList.add('active');
            notification.classList.add('hidden');
            document.getElementById('chat-input').focus();
        } else {
            container.classList.remove('active');
            toggle.classList.remove('active');
        }
    };

    // Auto resize textarea
    window.autoResize = function(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };

    // Handle key press
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    // Enviar mensagem
    window.sendMessage = async function() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        showTyping();

        try {
            // Send to Claude API
            const response = await fetch('/api/claude/analisar-texto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    texto: message,
                    contexto: 'chat_assistente',
                    historico: messageHistory.slice(-5)
                })
            });

            const data = await response.json();

            hideTyping();

            if (data.success) {
                const claudeResponse = data.resposta || data.analise?.resumo || 'Como posso ajudá-lo com licitações hoje?';
                addMessage(claudeResponse, 'claude');
            } else {
                addMessage('Desculpe, ocorreu um erro. Posso ajudá-lo de outra forma?', 'claude');
            }
        } catch (error) {
            hideTyping();
            addMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'claude');
        }
    };

    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div>${text}</div>
            <div class="message-time">${timeString}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in history
        messageHistory.push({ sender, text, time: now.toISOString() });
    }

    function showTyping() {
        const typing = document.getElementById('typing-indicator');
        const sendBtn = document.getElementById('send-button');

        typing.style.display = 'block';
        sendBtn.disabled = true;

        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('typing-indicator');
        const sendBtn = document.getElementById('send-button');

        typing.style.display = 'none';
        sendBtn.disabled = false;
    }

    // Initialize notification
    setTimeout(() => {
        const notification = document.getElementById('chat-notification');
        if (notification) {
            notification.classList.remove('hidden');
        }
    }, 3000);
}

// Funções do header
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || window.location.hash.replace('#', '') || 'portal.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href').replace('./', '');
        if (linkHref === currentPage || linkHref.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

window.openSettings = function() {
    alert('Configurações - Em desenvolvimento');
};

window.logout = function() {
    if (confirm('Deseja realmente sair do sistema?')) {
        window.location.href = '/login.html';
    }
};

// Inicializar componentes quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Inserir header se existir container
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = createSystemHeader();
    }

    // Inserir footer se existir container
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = createSystemFooter();
    }

    // Inserir chat se existir container
    const chatContainer = document.getElementById('chat-container-widget');
    if (chatContainer) {
        chatContainer.innerHTML = createClaudeChat();
    }

    // Garantir que os links de navegação funcionem
    setTimeout(() => {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Permitir navegação normal
                console.log('Navegando para:', this.href);
            });
        });
    }, 100);

    // Inicializar funcionalidades
    updateActiveNavLink();
    initializeClaudeChat();
});