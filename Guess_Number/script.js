'use strict';

// console.log(document.querySelector('.message').textContent);

// document.querySelector('.message').textContent = 'Correct Number!';

// document.querySelector('.guess').value = 23;
// console.log(document.querySelector('.guess').value);

function generateActualNum() {
  return Math.trunc(Math.random() * 20) + 1;
}
let actualNumber = generateActualNum();
let score = 20;
let highScore = [];

document.querySelector('.check').addEventListener('click', function () {
  const guess = Number(document.querySelector('.guess').value);

  if (guess !== 0) {
    if (score > 0) {
      if (guess > actualNumber) {
        document.querySelector('.message').textContent = 'Guess too high !';
        score--;
        //highScore.push(score);
      } else if (guess < actualNumber) {
        document.querySelector('.message').textContent = 'Guess too Low !';
        score--;
        //highScore.push(score);
      }
      //winning section
      else {
        document.querySelector('.message').textContent =
          'Correct Number !!! 😀';
        document.querySelector('body').style.backgroundColor = 'green';
        document.querySelector('.number').style.width = '30rem';
        document.querySelector('.number').textContent = actualNumber;
        highScore.push(score);
        document.querySelector('.highscore').textContent = highScore
          .sort()
          .reverse()[0];
        console.log(highScore.sort().reverse()[0]);
      }
      document.querySelector('.score').textContent = score;
      console.log(highScore.sort().reverse());
    } else {
      document.querySelector('.message').textContent =
        'You lost the game !! 😥';
    }
  } else {
    document.querySelector('.message').textContent = 'Enter a number!';
  }
});

document.querySelector('.again').addEventListener('click', function () {
  document.querySelector('.score').textContent = 20;
  document.querySelector('.number').textContent = '?';
  document.querySelector('body').style.backgroundColor = '#222';
  document.querySelector('.guess').value = '';
  actualNumber = generateActualNum();
  document.querySelector('.message').textContent = 'Start Guessing...';
  document.querySelector('.highscore').textContent = highScore
    .sort()
    .reverse()[0];
});
