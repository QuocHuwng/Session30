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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/toDoList");
      setTasks(res.data);
    } catch (err) {
      console.error("Lỗi tải công việc:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    const start = Date.now();
    try {
      await axios.post("http://localhost:8080/toDoList", {
        taskName: newTask,
        done: false,
      });
      setNewTask("");
      await fetchTasks();
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 4000 - elapsed);
      setTimeout(() => setLoading(false), delay);
    }
  };

  const toggleTask = async (task: Task) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/toDoList/${task.id}`, {
        ...task,
        done: !task.done,
      });
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/toDoList/${id}`);
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (editingTask) {
      setLoading(true);
      try {
        await axios.put(
          `http://localhost:8080/toDoList/${editingTask.id}`,
          editingTask
        );
        setEditingTask(null);
        fetchTasks();
      } finally {
        setLoading(false);
      }
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

      <div className="filter-box">
        <button className="btn filter active">Tất cả</button>
        <button className="btn filter">Hoàn thành</button>
        <button className="btn filter">Đang thực hiện</button>
      </div>

      {loading ? (
        <div className="loading"></div>
      ) : (
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
                    setEditingTask({
                      ...editingTask,
                      taskName: e.target.value,
                    })
                  }
                />
              ) : (
                <span className={task.done ? "completed" : ""}>
                  {task.taskName}
                </span>
              )}
              <div className="actions">
                {editingTask?.id === task.id ? (
                  <button onClick={saveEdit}>Lưu</button>
                ) : (
                  <button onClick={() => setEditingTask(task)}>Sửa</button>
                )}
                <button onClick={() => deleteTask(task.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="action-box">
        <button
          className="btn danger"
          onClick={() =>
            tasks
              .filter((t) => t.done)
              .forEach((t) =>
                axios.delete(`http://localhost:8080/toDoList/${t.id}`)
              )
          }
        >
          Xóa công việc hoàn thành
        </button>
        <button
          className="btn danger"
          onClick={() =>
            tasks.forEach((t) =>
              axios.delete(`http://localhost:8080/toDoList/${t.id}`)
            )
          }
        >
          Xóa tất cả công việc
        </button>
      </div>
    </div>
  );
}

export default App;