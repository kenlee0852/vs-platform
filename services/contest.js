import firebase from "firebase/app"
import { db } from '~/plugins/firebase.js';

export class Contest {
    candidates = [];
    matches = [];
    match = {};
    level = 0;
    round = 0;
    result = {};
    contestId = null;
    clientId = null;
    winner = null;

    constructor(candidates, level, contestId, clientId) {
        this.candidates = candidates.slice(0, level);
        this.level = level;
        this.contestId = contestId;
        this.clientId = clientId;
    }

    async init() {
        this.levelInit();
        await this.newContestHistory();

    }
    shuffle() {
        for (let i = this.candidates.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.candidates[i];
            this.candidates[i] = this.candidates[j];
            this.candidates[j] = temp;
        }
    }

    levelInit() {
        this.shuffle();
        this.matches.length = 0;
        this.result[this.level] = [];
        for (let i = 0; i <= this.level / 2; i += 2) {
            const match = {
                candidate1: this.candidates[i],
                candidate2: this.candidates[i + 1]
            }
            this.matches.push(match);
        }
        this.round = 0;
        this.match = this.matches[0];
    }

    async nextRound(winnerIndex, loseIndex) {
        this.candidates.splice(0, 2);
        this.candidates.push(winnerIndex);
        this.result[this.level].push({
            win: winnerIndex,
            lose: loseIndex
        });
        if (this.isReachNextLevel()) {
            this.level /= 2;
            if (this.isComplete()) {
                this.winner = winnerIndex;
            }
            else this.levelInit();
        }
        else {
            this.round += 1;
            this.match = this.matches[this.round];
        }
        await this.updateContestHistory();
    }

    isReachNextLevel() {
        // top 8 will need 4 round, here round index from 0)
        return this.round + 1 === this.level / 2;
    }

    isComplete() {
        return this.level === 1;
    }

    newContestHistory() {
        const data = {
            involveCount: this.level,
            level: this.level,
            round: 0,
            matches: this.matches,
            candidates: this.candidates,
            result: this.result,
            winner: this.winner,
        }
        return db.collection("contest-history").doc(this.contestId).collection("history")
            .doc(this.clientId).set(data);
    }

    updateContestHistory() {
        const updateQuery = {
            level: this.level,
            round: this.round,
            candidates: this.candidates,
            matches: this.matches,
            result: this.result,
            winner: this.winner,
        };
        return db.collection("contest-history").doc(this.contestId).collection("history").doc(this.clientId).update(updateQuery);
    }
}
function newContest(contest) {
    return db.collection("contests").add({
        name: contest.name,
        candidates: contest.candidates,
        createdAt: firebase.firestore.Timestamp.now()
    });
}

function getAllContest() {
    return db.collection("contests").get();
}

function getContestById(contestId) {
    return db.collection("contests").doc(contestId).get();
}

function getContestHistory(contestId, clientId) {
    return db.collection("contest-history").doc(contestId).collection("history").doc(clientId).get();
}

function getContestStatById(contestId) {
    return db.collection("contest-history").doc(contestId).collection("history").get();
}
export default {
    newContest,
    getContestById,
    getAllContest,
    getContestHistory,
    getContestStatById
}