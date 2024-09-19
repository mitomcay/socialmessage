document.addEventListener('DOMContentLoaded', () => {
    // Like button functionality
    const likeButtons = document.querySelectorAll('.tweet-actions button:nth-child(3)');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('i');
            const likesCount = button.textContent.trim().split(' ')[1];
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#e0245e';
                button.textContent = ` ${parseInt(likesCount) + 1}`;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                button.textContent = ` ${parseInt(likesCount) - 1}`;
            }
        });
    });

    // Retweet button functionality
    const retweetButtons = document.querySelectorAll('.tweet-actions button:nth-child(2)');
    retweetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('i');
            const retweetCount = button.textContent.trim().split(' ')[1];
            if (icon.style.color !== 'rgb(23, 191, 99)') {
                icon.style.color = '#17bf63';
                button.textContent = ` ${parseInt(retweetCount) + 1}`;
            } else {
                icon.style.color = '';
                button.textContent = ` ${parseInt(retweetCount) - 1}`;
            }
        });
    });

    // Tweet box character count
    const tweetTextarea = document.querySelector('.tweet-box textarea');
    const tweetButton = document.querySelector('.tweet-box .tweet-btn');
    const maxChars = 280;

    tweetTextarea.addEventListener('input', () => {
        const remainingChars = maxChars - tweetTextarea.value.length;
        if (remainingChars < 0) {
            tweetButton.disabled = true;
            tweetButton.style.opacity = '0.5';
        } else {
            tweetButton.disabled = false;
            tweetButton.style.opacity = '1';
        }
    });
});