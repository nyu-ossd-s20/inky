function union(sets) {
    const u = new Set();
    for (const set of sets) {
        for (const elem of set) {
            u.add(elem);
        }
    }
    return u;
}

// Helper function that gets all the divert targets from a list of InkFiles
function getAllDivertTargets(files) {
    return union(files.map((file) => file.symbols.getCachedDivertTargets()));
}

// Helper function that gets all the variable names from a list of InkFiles
function getAllVariables(files) {
    return union(files.map((file) => file.symbols.getCachedVariables()));
}

// Helper function that gets all the vocabulary words from a list of InkFiles
function getAllVocabWords(files) {
    return union(files.map((file) => file.symbols.getCachedVocabWords()));
}

// Helper function that generates suggestions for all the divert targets
function getAllDivertTargetSuggestions(inkFiles) {
    const targets = getAllDivertTargets(inkFiles);
    const suggestions = [];
    for (const target of targets) {
        suggestions.push({
            caption: target,
            value: target,
            meta: "Divert Target",
        });
    }
    return suggestions;
}

// Helper function that generates suggestions for all the variables
function getAllVariableSuggestions(inkFiles) {
    const variables = getAllVariables(inkFiles);
    const suggestions = [];
    for (const variable of variables) {
        suggestions.push({
            caption: variable,
            value: variable,
            meta: "Variable",
        });
    }
    return suggestions;
}

let showVocab = true;

function enableVocabSuggestions(enable) {
    console.log("showVocab is " + showVocab);
    console.log("Trying to set to" + enable);
    showVocab = enable;
    console.log("showVocab toggled to " + showVocab);
    console.log("getVocabValue gives: " + getVocabValue());
}

function getVocabValue() {
    return showVocab;
}

exports.toggleVocab = (value) => {
    enableVocabSuggestions(value);
};

// Helper function that generates suggestions for all the vocabulary
function getAllVocabSuggestions(inkFiles) {
    console.log("showVocab = " + getVocabValue());
    if(!showVocab) return "";

    const vocabWords = getAllVocabWords(inkFiles);
    const suggestions = [];
    for (const vocabWord of vocabWords) {
        suggestions.push({
            caption: vocabWord,
            value: vocabWord,
            meta: "Vocabulary",
        });
    }
    return suggestions;
}


exports.inkCompleter = {
    inkFiles: [],

    getCompletions(editor, session, pos, prefix, callback) {
        // There are three possible ways we may want to suggest completions:
        //
        // 1) If we are in a divert or divert target, we should only suggest
        //    target names.
        // 2) If we are in a logic section, we should suggest variables,
        //    targets, (because they can be used as variables) and vocab words.
        //    (because logic can output text)
        // 3) If we are not in either, we should only suggest vocab words.

        const cursorToken = session.getTokenAt(pos.row, pos.column);
        const isCursorInDivert = (cursorToken.type.indexOf("divert") != -1);
        const isCursorInFlow = (cursorToken.type.indexOf("flow") != -1);
        const isCursorInLabel = (cursorToken.type.indexOf(".label") != -1);
        const isCursorInLogic = (cursorToken.type.indexOf("logic") != -1);

        // Ignore the prefix. ACE will find the most likely words in the list
        // for the prefix automatically.

        var suggestions;
        if( isCursorInDivert || isCursorInFlow || isCursorInLabel ) {
            suggestions = getAllDivertTargetSuggestions(this.inkFiles);
        } else if( isCursorInLogic ) {
            const divertTargetSuggestions = getAllDivertTargetSuggestions(this.inkFiles);
            const variableSuggestions = getAllVariableSuggestions(this.inkFiles);
            const vocabSuggestions = getAllVocabSuggestions(this.inkFiles);
            suggestions = divertTargetSuggestions.concat(variableSuggestions).
                    concat(vocabSuggestions);
        } else {
            suggestions = getAllVocabSuggestions(this.inkFiles);
        }

        callback(null, suggestions);
    }
};
