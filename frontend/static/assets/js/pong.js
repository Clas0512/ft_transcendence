$(document).ready(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const text = "Press 'Enter' to Start";
    
    var scale = window.devicePixelRatio;  
            
    canvas.width = Math.floor(600 * scale*2); 
    canvas.height = Math.floor(400 * scale*2); 

    writeText(canvas,ctx,text);
    
});

function writeText(canvas,ctx,text){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '50px Source Sans Pro';
    ctx.fillStyle = 'white';
    ctx.imageSmoothingQuality = 'high';
    const textWidth = ctx.measureText(text).width;
    const x = (canvas.width - textWidth) / 2;
    const y = 50;
    
    ctx.fillText(text, x, y);
}
async function pong(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio;
    const paddleWidth = 15 * scale;
    const paddleHeight = 150 * scale;
    const paddleSpeed = 10* scale;
    const ballSize=10 * scale;
    const speed=4*scale;
    const accelerationFactor = 0.2;
    const maxSpeedIncreaseFactor = 3;
    let player1Score = 0;
    let player2Score = 0;
    const scoreElement1 = document.getElementById('player1-scoreC');
    const scoreElement2 = document.getElementById('player2-scoreC');
    const playerName1 = document.getElementById('player1NameC');
    const playerName2 = document.getElementById('player2NameC');
    let paddle1Y = canvas.height / 2 - paddleHeight / 2;
    let paddle2Y = canvas.height / 2 - paddleHeight / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = speed;
    let ballSpeedY = speed;
    let gameEnded = false;
    
    const user=await getUserInfo();
	playerName1.innerText=user.username;
    playerName2.innerText="Joker";


    window.draw=function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
        ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

        // Draw ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
        ctx.fill();

        // Ball movement
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Collision detection
        if (ballY + ballSize < 0 || ballY > canvas.height) {
            ballSpeedY = -ballSpeedY;
        }
        if (ballX < paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1 + accelerationFactor;
            ballSpeedY *= 1 + accelerationFactor;
            // Limit the speed increase to the maxSpeedIncreaseFactor
            ballSpeedX = Math.min(ballSpeedX, speed * maxSpeedIncreaseFactor);
            ballSpeedY = Math.min(ballSpeedY, speed * maxSpeedIncreaseFactor);
        }
        
        if (ballX > canvas.width - paddleWidth && ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1 + accelerationFactor;
            ballSpeedY *= 1 + accelerationFactor;
            // Limit the speed increase to the maxSpeedIncreaseFactor
            ballSpeedX = Math.min(ballSpeedX, speed * maxSpeedIncreaseFactor);
            ballSpeedY = Math.min(ballSpeedY, speed * maxSpeedIncreaseFactor);
        }

        // Game over condition
        if (ballX < 0 || ballX > canvas.width) {
            if (ballX < 0) {
                updateScore(2);
            } else if (ballX > canvas.width) {
                updateScore(1);
            }
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            ballSpeedX = speed;
            ballSpeedY = speed;
        }

        if(!gameEnded){
            requestId = requestAnimationFrame(draw);
            handleKeyActions();
        }
    }

    function updateScore(player) {
        if (gameEnded) {
            return;
        }
    
        if (player === 1) {
            player1Score++;
            scoreElement1.textContent = player1Score;
        } else {
            player2Score++;
            scoreElement2.textContent = player2Score;
        }
    
        if (player1Score === 5 || player2Score === 5) {
            gameEnded = true;
            endGame();
            
        }
    }

    function endGame() {
        cancelAnimationFrame(requestId);
        if (player1Score === 5) {
            writeText(canvas,ctx,"Player 1 won!");
            saveWinner(user.username);
        } else {
            writeText(canvas,ctx,"Player 2 won!");
            saveWinner("Joker");

        }
    }

    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'w':
            case 'ArrowUp':
            case 's':
            case 'ArrowDown':
                event.preventDefault();
                break;
            case 'Enter':
                draw();
                break;
            case 'Escape':
                cancelAnimationFrame(requestId);
        }        
    });
    let keysState = {
        'w': false,
        's': false,
        'ArrowUp': false,
        'ArrowDown': false,
        'Enter':false,
        'Escape':false,
    };
    window.addEventListener('keydown', function(event) {
        keysState[event.key] = true;
    });
    
    window.addEventListener('keyup', function(event) {
        keysState[event.key] = false;
    });
    function handleKeyActions() {
        console.log(keysState)
        if (keysState['w']) {
            if (paddle1Y > 0) {
                paddle1Y -= paddleSpeed;
            }
        }
    
        if (keysState['s']) {
            if (paddle1Y + paddleHeight < canvas.height) {
                paddle1Y += paddleSpeed;
            }
        }
    
        if (keysState['ArrowUp']) {
            if (paddle2Y > 0) {
                paddle2Y -= paddleSpeed;
            }
        }
    
        if (keysState['ArrowDown']) {
            if (paddle2Y + paddleHeight < canvas.height) {
                paddle2Y += paddleSpeed;
            }
        }
    
    }
}
async function saveWinner(winner){
    const user=await getUserInfo();
    var data = {
		"username":user.username,
        "who_win": winner,
        "game_type":"Classic"
	};
	fetch('https://peng.com.tr/backend/match/', {
        method: 'POST',
        headers: {
			'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(data.message);
        }
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
