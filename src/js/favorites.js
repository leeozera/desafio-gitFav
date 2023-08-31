// Funcao que busca o usuario no gitHub
export class GitHubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

// Classe que contem toda a logica dos dados e manipulação
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load(); // Define como se fosse uma variavel que recebe o ID do elemento
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      let hasUser = this.entries.some((user) => user.login === username);
      console.log(hasUser);
      if (hasUser) {
        throw new Error("Usuario ja adicionado");
        return;
      }

      const user = await GitHubUser.search(username);
      if (user.login === undefined) {
        throw new Error("usuario nao encontrado");
      }

      this.entries = [user, ...this.entries];
      this.uptade();
      this.save();
    } catch (error) {
      const errorEl = document.querySelector("#error");
      errorEl.style.display = "block";
      errorEl.textContent = error;

      setTimeout(() => {
        errorEl.style.display = "none";
      }, 3000);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.uptade();
    this.save();
  }
}

// Classe que trata a visualização e Eventos
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root); // super se refere a classe pai, neste caso "Favorites", execuntando o costrutor root do elemento pai
    this.tbody = this.root.querySelector("table tbody");
    this.uptade();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector("header #onAddUser");

    addButton.onclick = () => {
      let { value } = this.root.querySelector("#search");
      this.add(value);
      this.root.querySelector("#search").value = "";
    };
  }

  uptade() {
    this.removeAllTr();

    if (this.entries.length === 0) {
      const row = this.notFavorite();
      row.classList.add("notFavorite");
      this.tbody.append(row);
    } else {
      this.entries.forEach((user) => {
        // Faz um loop no array de objetos , para cada objeto ele adiciona uma linha
        const row = this.createRow();
        row.querySelector("img").src = `https://github.com/${user.login}.png`;
        row.querySelector("img").alt = user.name;
        row.querySelector("a p").textContent = user.name;
        row.querySelector("a span").textContent = `/${user.login}`;
        row.querySelector("a").href = `https://github.com/${user.login}`;
        row.querySelector(".repositories").textContent = user.public_repos;
        row.querySelector(".followers").textContent = user.followers;

        row.querySelector(".action .remove").onclick = () => {
          let isOk = confirm("Deseja realmente remover este usuario ? ");
          if (isOk) {
            console.log(user);
            this.delete(user);
          }
        };

        this.tbody.append(row); // Adicona a linha no tbody
      });
    }
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }

  notFavorite() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <tr id="notFavorite" style="display: none">
    <td>
      <img
        src="./src/assets/star2.svg"
        alt="vetor estrela assutada"
      />
      <h2>Nenhum favorito ainda</h2>
    </td>
  </tr>`;
    return tr;
  }

  createRow() {
    // Cria a linha da tabela
    const tr = document.createElement("tr"); // Cria uma linha atraves do DOM
    tr.innerHTML = ` <tr>
    <td class="user">
      <img
        src="https://github.com/diego3g.png"
        width="56px"
        height="56px"
        alt=""
      />
      <a href="" target="_blank">
        <p class="name">Diego Fernandes</p>
        <span class="login">/diego3g</span>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">123</td>
    <td class="action">
      <button class="remove">Remover</button>
    </td>
  </tr>
    `;
    return tr;
  }
}
