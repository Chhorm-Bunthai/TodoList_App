import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { taskContractAbi, taskContractAddress } from "./utils/config";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
  Container,
} from "@mui/material";

function useBlockchainData() {
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async (provider) => {
      try {
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
      } catch (error) {
        setError("Error loading blockchain data: " + error.message);
      }
    };

    const loadBlockchainData = async () => {
      try {
        if (window.ethereum && window.ethereum.isMetaMask) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await fetchTasks(provider);
        } else {
          setError("MetaMask not detected or not enabled!");
        }
      } catch (error) {
        setError("Error loading blockchain data: " + error.message);
      }
    };

    loadBlockchainData();

    return () => {}; // Cleanup function
  }, []);

  return { taskCount, tasks, loading, error };
}

function App() {
  const [newTaskContent, setNewTaskContent] = useState("");

  const { taskCount, tasks, loading, error } = useBlockchainData();

  const handleCreateTask = async () => {
    if (!newTaskContent) return;
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const todoListContract = new ethers.Contract(
        taskContractAddress,
        taskContractAbi,
        signer
      );
      await todoListContract.createTask(newTaskContent);
      setNewTaskContent("");
    } catch (error) {
      setError("Error creating task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async (taskId) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const todoListContract = new ethers.Contract(
        taskContractAddress,
        taskContractAbi,
        signer
      );
      await todoListContract.toggleCompleted(taskId);
    } catch (error) {
      setError("Error toggling task completion: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h1" component="h1">
        Todo List
      </Typography>
      {error && <div className="error">{error}</div>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{ margin: "20px 0", display: "flex", alignItems: "center" }}
        >
          <TextField
            type="text"
            placeholder="Enter new task"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            style={{ marginRight: "10px", flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTask}
            disabled={loading}
            style={{ width: "120px" }}
          >
            {loading ? "Adding Task..." : "Add Task"}
          </Button>
        </div>
        <div>
          <List>
            {tasks.map((task) => (
              <ListItem key={task.id} disablePadding>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleCompleted(task.id)}
                        disabled={loading}
                      />
                    }
                    label={
                      <ListItemText
                        primary={task.content}
                        style={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                        }}
                      />
                    }
                  />
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </Container>
  );
}

export default App;
