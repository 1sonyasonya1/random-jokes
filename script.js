class JokesBaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
class HTTPError extends JokesBaseError {
    constructor(response) {
        let message = `HTTP Error. Status code: ${response.status}.`
        super(+ message)
    }
}
class PrevNotExistError extends JokesBaseError {
    constructor() {
        super('Previous joke not exist')
    }
}

//HTTP
const httpJokesRepo = {}
httpJokesRepo.getJoke = async function () {
    const response = await fetch('https://official-joke-api.appspot.com/jokes/random');
    if (!response.ok) {
        throw new HTTPError(response)
    }
    const data = await response.json();
    return data;
}

//Mock
const mockJokesRepo = {
    id: 0
}
mockJokesRepo.getJoke = async function () {
    this.id++
    return {
        id: this.id,
        punchline: `Punchline ${this.id}`,
        setup: `Setup ${this.id}`
    }
}

//JokesQueue
class JokesQueue {
    constructor(jokesRepo) {
        this.position = -1
        this.jokes = []
        this.jokesRepo = jokesRepo
    }

    currentJoke() {
        return this.jokes[this.position];
    }

    prevJoke() {
        if (this.position <= 0) {
            throw new PrevNotExistError();
        }
        this.position--;
        return this.jokes[this.position];
    }

    async nextJoke() {
        if (this.position >= this.jokes.length - 1) {
            const joke = await this.jokesRepo.getJoke();
            this.jokes.push(joke);
        }
        this.position++
        return this.jokes[this.position];
    }

    get total() {
        return this.jokes.length;
    }

    get current() {
        return this.position + 1;
    }
}

const jokesQ = new JokesQueue(httpJokesRepo);

//Event
const nextBtn = document.querySelector('.footer__btn--next');
const prevBtn = document.querySelector('.footer__btn--prev');
const punchBtn = document.querySelector('.footer__btn--answer');

const setup = document.querySelector('.jokes__setup');
const punchline = document.querySelector('.jokes__punchline');
const current = document.querySelector('.footer__text');


async function loadJoke() {
    const joke = await jokesQ.nextJoke();
    setup.textContent = joke.setup;
    punchline.textContent = '';
    current.textContent = `Joke ${jokesQ.current} of ${jokesQ.total}`
}

loadJoke();

nextBtn.addEventListener('click', async (event) => {
    if (event.target.closest('.footer__btn--next')) {
        loadJoke();
    }
})

punchBtn.addEventListener('click', (event) => {
    if (event.target.closest('.footer__btn--answer')) {
        const joke = jokesQ.currentJoke();
        punchline.textContent = joke.punchline;
    }
})

prevBtn.addEventListener('click', (event) => {
    if (event.target.closest('.footer__btn--prev')) {
        try {
            const joke = jokesQ.prevJoke();
            setup.textContent = joke.setup;
            punchline.textContent = '';
            current.textContent = `Joke ${jokesQ.current} of ${jokesQ.total}`
        } catch { };
    }
})