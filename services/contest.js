import firebase from "firebase/app"
import { db } from '~/plugins/firebase.js';

function newContest(contest) {
    return db.collection("contests").add({
        name: contest.name,
        candidates: contest.candidates,
        createdAt: firebase.firestore.Timestamp.now()
    });
}

function getContestById(contestId) {
    return db.collection("contests").doc(contestId).get();
}

function newContestHistory({ contestId, clientId, involveCount, matches, candidates, matchResult }) {
    const data = {
        involveCount,
        level: involveCount,
        round: 0,
        matches: JSON.stringify(matches.map(match => [match[0].index, match[1].index])),
        candidates: candidates.map(candidate => candidate.index),
        matchResult,
    }
    return db.collection("contest-history").doc(contestId).collection("history").doc(clientId).set(data);
}

function updateContestHistory({ contestId, clientId, level, round, candidates, matches, matchResult, winner }) {
    const updateQuery = {};
    if (level) updateQuery.level = level;
    if (round != null) updateQuery.round = round;
    if (candidates) updateQuery.candidates = candidates.map(candidate => candidate.index);
    if (matches) updateQuery.matches = JSON.stringify(matches.map(match => [match[0].index, match[1].index]));
    if (matchResult) updateQuery.matchResult = matchResult;
    if (winner) updateQuery.winner = winner.index;
    return db.collection("contest-history").doc(contestId).collection("history").doc(clientId).update(updateQuery);
}

function getContestHistory(contestId, clientId) {
    return db.collection("contest-history").doc(contestId).collection("history").doc(clientId).get();
}
export default {
    newContest,
    getContestById,
    newContestHistory,
    updateContestHistory,
    getContestHistory
}