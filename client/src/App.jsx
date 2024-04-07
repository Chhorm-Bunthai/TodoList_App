import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { taskContractAbi, taskContractAddress } from "./utils/config";

function App() {
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeProvider = () =>
    new ethers.providers.Web3Provider(window.ethereum);

  const fetchTasks = async (provider) => {
    const signer = provider.getSigner();
    const todoListContract = new ethers.Contract(
      taskContractAddress,
      taskContractAbi,
      signer
    );
    const count = await todoListContract.taskCount();
    setTaskCount(count.toNumber());
    const loadedTasks = [];
    for (let i = 1; i <= count; i++) {
      const task = await todoListContract.tasks(i);
      loadedTasks.push({
        id: task.id.toNumber(),
        content: task.content,
        completed: task.completed,
      });
    }
    setTasks(loadedTasks);
  };

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (window.ethereum && window.ethereum.isMetaMask) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = initializeProvider();
          const todoListContract = new ethers.Contract(
            taskContractAddress,
            taskContractAbi,
            provider
          );
          await fetchTasks(provider);

          // Event listeners for TaskCreated and TaskCompleted events
          const handleTaskCreated = async (
            taskId,
            content,
            completed,
            event
          ) => {
            await fetchTasks(provider);
          };
          const handleTaskCompleted = async (taskId, completed, event) => {
            await fetchTasks(provider);
          };
          todoListContract.on("TaskCreated", handleTaskCreated);
          todoListContract.on("TaskCompleted", handleTaskCompleted);

          // Cleanup function to remove event listeners when component unmounts
          return () => {
            todoListContract.removeListener("TaskCreated", handleTaskCreated);
            todoListContract.removeListener(
              "TaskCompleted",
              handleTaskCompleted
            );
          };
        } else {
          setError("MetaMask not detected or not enabled!");
        }
      } catch (error) {
        setError("Error loading blockchain data: " + error.message);
      }
    };

    loadBlockchainData();
  }, []);

  const handleCreateTask = async () => {
    if (!newTaskContent) return;
    try {
      setLoading(true);
      const provider = initializeProvider();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const todoListContract = new ethers.Contract(
        taskContractAddress,
        taskContractAbi,
        signer
      );
      await todoListContract.createTask(newTaskContent);
      setNewTaskContent("");
      await fetchTasks(provider);
    } catch (error) {
      setError("Error creating task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async (taskId) => {
    try {
      setLoading(true);
      const provider = initializeProvider();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const todoListContract = new ethers.Contract(
        taskContractAddress,
        taskContractAbi,
        signer
      );
      await todoListContract.toggleCompleted(taskId);
      await fetchTasks(provider);
    } catch (error) {
      setError("Error toggling task completion: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      {error && <div className="error">{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Enter new task"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
        />
        <button onClick={handleCreateTask} disabled={loading}>
          {loading ? "Adding Task..." : "Add Task"}
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleCompleted(task.id)}
              disabled={loading}
            />
            <span>{task.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
