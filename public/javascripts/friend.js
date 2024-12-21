window.onload = function () {
    loadfriend();
};

async function loadfriend() {
    try {
        const response = await fetch('/friend/allfriend');
        if (!response.ok) {
            throw new Error('Failed to load friends');
        }
        const data = await response.json();
        const friendDiv = document.querySelector('.friend-info');
        friendDiv.innerHTML = '';
        console.log(data.friends);

        if (data.friends.length === 0) {
            friendDiv.innerHTML = '<p>No friends found.</p>';
            return;
        }

        data.friends.forEach(friend => {
            friendDiv.innerHTML += `
                <p>Friend: ${friend.username} - Status: ${friend.friendshipType}</p>
            `;
        });
    } catch (error) {
        console.error('Error loading friends:', error);
        document.querySelector('.friend-info').innerHTML = '<p>Error loading friends. Please try again later.</p>';
    }
}

async function Accept(requestId) {
    const response = await fetch('/friend/acceptfriend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.reload();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function searchFriends() {
    const searchInput = document.getElementById('friend-search').value;

    if (!searchInput) {
        alert('Please enter a name to search.');
        return;
    }

    fetch(`/friend/search?name=${encodeURIComponent(searchInput)}`)
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';

        if (data.length === 0) {
            resultsDiv.innerHTML = '<p>No friends found.</p>';
            return;
        }

        console.log(data);

        data.forEach(friend => {
            if (!friend.isFriend){
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.innerHTML = `
                    <p>${friend.username}</p>
                    <button onclick="sendFriendRequest('${friend._id}')">Send Friend Request</button>
                `;
                resultsDiv.appendChild(friendElement);
            }
            else{
                const friendElement = document.createElement('div');
                friendElement.classList.add('friend-item');
                friendElement.innerHTML = `
                    <p>${friend.username}</p>
                    <button onclick="sendFriendRequest('${friend._id}')" disabled >Da la ban</button>
                `;
                resultsDiv.appendChild(friendElement);
            }
        });
    })
    .catch(error => {
        console.error('Error searching for friends:', error);
    });
}

function sendFriendRequest(receiverId) {
    fetch('/friend/addfriend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}