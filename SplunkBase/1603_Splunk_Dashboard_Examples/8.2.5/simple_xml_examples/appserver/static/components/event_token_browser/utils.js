define(function () {
    return {
        filterActionHistory(actionCollection, actionConfigs) {
            return actionCollection.filter((actionModel) =>
                actionConfigs.get(actionModel.actionName) === true
            );
        }
    };
});