// ================= LOAD POSTS =================

async function loadPosts() {

    const response = await fetch("/api/posts");

    const posts = await response.json();

    const postsDiv = document.getElementById("posts");

    postsDiv.innerHTML = "";

    posts.forEach(post => {

        postsDiv.innerHTML += `

            <div class="post">

                <h3>👤 ${post.username}</h3>

                <p>${post.text}</p>

                <button onclick="likePost('${post._id}')">
                    ❤️ Like
                </button>

                <span>
                    ${post.likes} Likes
                </span>

                <br>

                <input
                    class="comment-input"
                    id="comment-${post._id}"
                    placeholder="Write a comment..."
                >

                <button onclick="addComment('${post._id}')">
                    💬 Comment
                </button>

                <div id="comments-${post._id}">
                </div>

            </div>
        `;

        loadComments(post._id);
    });
}


// ================= CREATE POST =================

async function createPost() {

    const text = document.getElementById("postText").value;

    if (text === "") {

        alert("Please write something!");

        return;
    }

    await fetch("/api/posts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            username: "Laiba",

            text: text

        })
    });

    document.getElementById("postText").value = "";

    loadPosts();
}


// ================= LIKE POST =================

async function likePost(id) {

    await fetch(`/api/posts/${id}/like`, {

        method: "PUT"

    });

    loadPosts();
}


// ================= ADD COMMENT =================

async function addComment(postId) {

    const input =
        document.getElementById(`comment-${postId}`);

    const text = input.value;

    if (text === "") {

        alert("Please write a comment!");

        return;
    }

    await fetch("/api/comments", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            postId: postId,

            username: "Laiba",

            text: text

        })
    });

    input.value = "";

    loadComments(postId);
}


// ================= LOAD COMMENTS =================

async function loadComments(postId) {

    const response =
        await fetch(`/api/comments/${postId}`);

    const comments = await response.json();

    const commentsDiv =
        document.getElementById(`comments-${postId}`);

    if (!commentsDiv) return;

    commentsDiv.innerHTML = "";

    comments.forEach(comment => {

        commentsDiv.innerHTML += `

            <div class="comment">

                <b>${comment.username}</b>

                <p>${comment.text}</p>

            </div>

        `;
    });
}


// ================= FOLLOW USER =================

let following = false;

async function followUser() {

    const usersResponse =
        await fetch("/api/users");

    const users = await usersResponse.json();

    if (users.length === 0) {

        alert("User not found in database.");

        return;
    }

    const user = users[0];

    if (!following) {

        const response =
            await fetch(`/api/users/${user._id}/follow`, {

                method: "PUT"

            });

        const updatedUser = await response.json();

        document.getElementById("followers").innerText =
            "Followers: " + updatedUser.followers;

        following = true;

        event.target.innerText = "Following";

    } else {

        following = false;

        event.target.innerText = "Follow";
    }
}


// ================= START APP =================

loadPosts();