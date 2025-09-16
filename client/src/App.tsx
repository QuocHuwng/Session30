import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";

type Task = {
  id: number;
  taskName: string;
  done: boolean;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/toDoList")
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    axios
      .post("http://localhost:8080/toDoList", {
        taskName: newTask,
        done: false,
      })
      .then(() => {
        fetchTasks();
        setNewTask("");
      });
  };

  const toggleTask = (task: Task) => {
    axios
      .put(`http://localhost:8080/toDoList/${task.id}`, {
        ...task,
        done: !task.done,
      })
      .then(() => fetchTasks());
  };

  const deleteTask = (id: number) => {
    axios.delete(`http://localhost:8080/toDoList/${id}`).then(() => fetchTasks());
  };

  const saveEdit = () => {
    if (editingTask) {
      axios
        .put(`http://localhost:8080/toDoList/${editingTask.id}`, editingTask)
        .then(() => {
          fetchTasks();
          setEditingTask(null);
        });
    }
  };

  return (
    <div className="container">
      <h1>Quản lý công việc</h1>

      <div className="input-box">
        <input
          type="text"
          placeholder="Nhập tên công việc"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="btn add" onClick={addTask}>
          Thêm công việc
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task)}
            />

            {editingTask?.id === task.id ? (
              <input
                type="text"
                value={editingTask.taskName}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, taskName: e.target.value })
                }
              />
            ) : (
              <span className={task.done ? "completed" : ""}>
                {task.taskName}
              </span>
            )}

            <div className="actions">
              {editingTask?.id === task.id ? (
                <button className="save" onClick={saveEdit}>
                  Lưu
                </button>
              ) : (
                <button className="edit" onClick={() => setEditingTask(task)}>
                  Sửa
                </button>
              )}
              <button className="delete" onClick={() => deleteTask(task.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;