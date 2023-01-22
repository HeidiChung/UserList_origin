const BASE_URL = 'https://user-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/users/';
const User_PER_PAGE = 12 //每一頁有12部電影
const users = [];
let filteredUsers = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector('#paginator')

// step 2. Render主頁
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((user) => {
    rawHTML += `
      <div class="col-sm-3">
      <div class="mb-2">
      <div class="card">
        <img src="${user.avatar}" class="card-img-top" alt="User-img" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
        <div class="card-body">
          <h5 class="card-title">${user.name}${user.surname}</h5>
          <button type="button" class="btn btn-link position-absolute top-0 end-0 text-muted" id="heart-btn">
          <i class="btn-add-favorite fa-solid fa-heart-circle-plus" data-id="${user.id}"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
`;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / User_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += ` <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


function getUsersByPage(page) {
  // 以下解釋為 如果filteredUser為有東西的就回傳filteredUsers ,沒有就回傳users
  const data = filteredUsers.length ? filteredUsers : users

  const startIndex = (page - 1) * User_PER_PAGE
  return data.slice(startIndex, startIndex + User_PER_PAGE)
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id);
  if (list.some(user => user.id === id)) {
    return alert('This user has already been added to favorite list.')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    showUserModal((event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return;
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  console.log("click");
  const keyword = searchInput.value.trim().toLowerCase();

  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的User`);
  }
  //重新輸出至畫面
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1));

});

//2.3 渲染modal內容
function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalBirthday = document.querySelector("#user-modal-birthday");

  axios.get(INDEX_URL + id).then((response) => {
    console.log(response.data);
    const data = response.data;
    modalTitle.innerText = data.name + data.surname;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-img" class="img-fluid">`;
    modalGender.innerText = "Gender: " + data.gender;
    modalAge.innerText = "Age: " + data.age;
    modalRegion.innerText = "Region: " + data.region;
    modalEmail.innerText = "Email: " + data.email;
    modalBirthday.innerText = "Birthday: " + data.birthday;
  });
}

axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1));
  })
  // .catch((err) => console.log(err));