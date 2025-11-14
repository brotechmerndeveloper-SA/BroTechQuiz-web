class TechQuiz {
    constructor() {
        this.currentUser = null;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeLeft = 30;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadQuizData();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('signup');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthForm('login');
        });

        
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

    
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-quiz')) {
                if (!this.currentUser) {
                    this.showNotification('Please sign in first!', 'error');
                    this.showScreen('auth');
                    return;
                }
                const language = e.target.closest('.language-card').dataset.language;
                this.startQuiz(language);
            }
        });

        document.getElementById('prev-question').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('submit-quiz').addEventListener('click', () => {
            this.submitQuiz();
        });

        
        document.getElementById('review-quiz').addEventListener('click', () => {
            this.reviewQuiz();
        });

        document.getElementById('new-quiz').addEventListener('click', () => {
            this.showScreen('dashboard');
        });
    }

    
    showAuthForm(formType) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (formType === 'signup') {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        } else {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
        }
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters!', 'error');
            return;
        }

        const users = this.getUsers();
        
        if (users.find(user => user.email === email)) {
            this.showNotification('User already exists!', 'error');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: btoa(password),
            createdAt: new Date().toISOString(),
            stats: {
                totalQuizzes: 0,
                totalQuestions: 0,
                averageScore: 0,
                quizzes: []
            }
        };

        users.push(newUser);
        localStorage.setItem('techquiz-users', JSON.stringify(users));
        
        this.showNotification('Account created successfully! Please sign in.', 'success');
        this.showAuthForm('login');
        document.getElementById('signup-form').reset();
    }

    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields!', 'error');
            return;
        }

        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === btoa(password));

        if (user) {
            this.currentUser = user;
            localStorage.setItem('techquiz-current-user', JSON.stringify(user));
            this.showScreen('dashboard');
            this.updateUserStats();
            this.showNotification(`Welcome back, ${user.name}!`, 'success');
            document.getElementById('login-form').reset();
        } else {
            this.showNotification('Invalid email or password!', 'error');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('techquiz-current-user');
        this.showScreen('auth');
        this.showAuthForm('login');
        this.showNotification('Logged out successfully!', 'success');
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('techquiz-current-user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showScreen('dashboard');
            this.updateUserStats();
        } else {
            this.showScreen('auth');
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('techquiz-users')) || [];
    }

    
    loadQuizData() {
        this.quizData = {
            html: [
                {
                    question: "What does HTML stand for?",
                    options: [
                        "Hyper Text Markup Language",
                        "High Tech Modern Language",
                        "Hyper Transfer Markup Language",
                        "Home Tool Markup Language"
                    ],
                    correct: 0
                },
                {
                    question: "Which HTML element is used for the largest heading?",
                    options: ["<heading>", "<head>", "<h1>", "<h6>"],
                    correct: 2
                },
                {
                    question: "What is the correct HTML for creating a hyperlink?",
                    options: [
                        "<a>http://www.example.com</a>",
                        "<a url='http://www.example.com'>Example</a>",
                        "<link>http://www.example.com</link>",
                        "<a href='http://www.example.com'>Example</a>"
                    ],
                    correct: 3
                },
                {
                    question: "Which character is used to indicate an end tag?",
                    options: ["/", "*", "<", ">"],
                    correct: 0
                },
                {
                    question: "How can you make a numbered list?",
                    options: ["<list>", "<ul>", "<ol>", "<dl>"],
                    correct: 2
                }
            ],
            css: [
                {
                    question: "What does CSS stand for?",
                    options: [
                        "Computer Style Sheets",
                        "Cascading Style Sheets",
                        "Creative Style System",
                        "Colorful Style Sheets"
                    ],
                    correct: 1
                },
                {
                    question: "Which property is used to change the background color?",
                    options: ["background-color", "bgcolor", "color", "background"],
                    correct: 0
                },
                {
                    question: "How do you make a list that lists its items with squares?",
                    options: [
                        "list-style: square;",
                        "list-type: square;",
                        "list-style-type: square;",
                        "list: square;"
                    ],
                    correct: 2
                },
                {
                    question: "Which CSS property controls the text size?",
                    options: ["text-style", "text-size", "font-style", "font-size"],
                    correct: 3
                },
                {
                    question: "How do you display hyperlinks without an underline?",
                    options: [
                        "text-decoration: none;",
                        "text-style: no-underline;",
                        "decoration: no-underline;",
                        "link-style: none;"
                    ],
                    correct: 0
                }
            ],
            javascript: [
                {
                    question: "Which of the following is a JavaScript data type?",
                    options: ["Boolean", "Function", "All of the above", "Number"],
                    correct: 0
                },
                {
                    question: "How do you create a function in JavaScript?",
                    options: [
                        "function myFunction()",
                        "function:myFunction()",
                        "function = myFunction()",
                        "create myFunction()"
                    ],
                    correct: 0
                },
                {
                    question: "Which operator is used to assign a value to a variable?",
                    options: ["==", "=+", "!=", "="],
                    correct: 3
                },
                {
                    question: "How do you write an IF statement in JavaScript?",
                    options: [
                        "if (condition) { }",
                        "if condition { }",
                        "if: condition then { }",
                        "if { condition }"
                    ],
                    correct: 0
                },
                {
                    question: "How can you add a comment in JavaScript?",
                    options: [
                        "<!-- This is a comment -->",
                        "// This is a comment",
                        "' This is a comment",
                        "* This is a comment *"
                    ],
                    correct: 1
                }
            ]
        };
    }

    startQuiz(language) {
        this.currentQuiz = {
            language: language,
            questions: this.quizData[language],
            startTime: new Date()
        };
        
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.quizData[language].length).fill(null);
        this.showScreen('quiz');
        this.loadQuestion();
        this.startTimer();
    }

    loadQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        document.getElementById('quiz-language').textContent = 
            `${this.currentQuiz.language.toUpperCase()} Quiz`;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentQuiz.questions.length;
        document.getElementById('question-text').textContent = question.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option';
            optionElement.type = 'button';
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });

        document.getElementById('prev-question').disabled = this.currentQuestionIndex === 0;
        
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        document.getElementById('next-question').style.display = isLastQuestion ? 'none' : 'inline-flex';
        document.getElementById('submit-quiz').style.display = isLastQuestion ? 'inline-flex' : 'none';
    }

    selectOption(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        document.querySelectorAll('.option').forEach((option, index) => {
            option.classList.toggle('selected', index === optionIndex);
        });
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
            this.resetTimer();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
            this.resetTimer();
        }
    }

    startTimer() {
        this.timeLeft = 30;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.autoProceed();
            }
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timer);
        this.startTimer();
    }

    updateTimerDisplay() {
        document.getElementById('timer').textContent = this.timeLeft;
        
        const circumference = 2 * Math.PI * 27;
        const offset = circumference - (this.timeLeft / 30) * circumference;
        const timerProgress = document.getElementById('timer-progress');
        
        if (timerProgress) {
            timerProgress.style.strokeDasharray = `${circumference} ${circumference}`;
            timerProgress.style.strokeDashoffset = offset;
            
            if (this.timeLeft <= 10) {
                timerProgress.style.stroke = 'var(--accent-danger)';
            } else if (this.timeLeft <= 20) {
                timerProgress.style.stroke = 'var(--accent-warning)';
            } else {
                timerProgress.style.stroke = 'var(--accent-primary)';
            }
        }
    }

    autoProceed() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
            this.startTimer();
        } else {
            this.submitQuiz();
        }
    }

    submitQuiz() {
        clearInterval(this.timer);
        
        const endTime = new Date();
        const timeTaken = Math.floor((endTime - this.currentQuiz.startTime) / 1000);
        
        let correctAnswers = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.currentQuiz.questions[index].correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / this.currentQuiz.questions.length) * 100);
        
        const quizResult = {
            id: Date.now().toString(),
            language: this.currentQuiz.language,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: this.currentQuiz.questions.length,
            timeTaken: timeTaken,
            date: new Date().toISOString()
        };
        
        this.saveQuizResult(quizResult);
        this.showResults(quizResult);
    }

    saveQuizResult(quizResult) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].stats.quizzes.push(quizResult);
            users[userIndex].stats.totalQuizzes++;
            users[userIndex].stats.totalQuestions += quizResult.totalQuestions;
            
            const totalScore = users[userIndex].stats.quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
            users[userIndex].stats.averageScore = Math.round(totalScore / users[userIndex].stats.quizzes.length);
            
            localStorage.setItem('techquiz-users', JSON.stringify(users));
            this.currentUser = users[userIndex];
            localStorage.setItem('techquiz-current-user', JSON.stringify(this.currentUser));
        }
    }

    showResults(quizResult) {
        document.getElementById('final-score').textContent = `${quizResult.score}%`;
        document.getElementById('correct-answers').textContent = 
            `${quizResult.correctAnswers}/${quizResult.totalQuestions}`;
        
        const minutes = Math.floor(quizResult.timeTaken / 60);
        const seconds = quizResult.timeTaken % 60;
        document.getElementById('time-taken').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('quiz-language-result').textContent = 
            quizResult.language.toUpperCase();
        
        this.showScreen('results');
    }

    reviewQuiz() {
        this.showNotification('Review feature coming soon!', 'info');
    }

    
    showScreen(screenName) {
        console.log('Switching to screen:', screenName); 
        
        
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'block';
            
            
            if (screenName === 'auth') {
                targetScreen.style.display = 'flex';
            } else if (screenName === 'results') {
                targetScreen.style.display = 'flex';
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        messageElement.textContent = message;
        
        switch (type) {
            case 'success':
                notification.style.background = 'var(--accent-success)';
                break;
            case 'error':
                notification.style.background = 'var(--accent-danger)';
                break;
            case 'warning':
                notification.style.background = 'var(--accent-warning)';
                break;
            default:
                notification.style.background = 'var(--accent-primary)';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateUserStats() {
        if (!this.currentUser) return;
        
        const stats = this.currentUser.stats;
        document.getElementById('user-greeting').textContent = `Welcome, ${this.currentUser.name}!`;
        document.getElementById('total-quizzes').textContent = stats.totalQuizzes;
        document.getElementById('average-score').textContent = `${stats.averageScore}%`;
        document.getElementById('total-questions').textContent = stats.totalQuestions;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new TechQuiz();
});