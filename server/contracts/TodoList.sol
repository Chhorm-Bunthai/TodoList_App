// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(
        uint id,
        string content,
        bool completed
    );
    event TaskCompleted(
        uint id,
        bool completed
    );

    constructor() {
        createTask("List of the tasks");
    }

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task storage _task = tasks[_id];
        _task.completed = !_task.completed;
        emit TaskCompleted(_id, _task.completed);
    }
}
