import { useState, useEffect } from "react";
import { useSheetStore } from "./store/useSheetStore";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableTopic from "./components/SortableTopic";
import SortableSubtopic from "./components/SortableSubtopic";

function App() {
  const {
    topics,
    addTopic,
    deleteTopic,
    addSubtopic,
    deleteSubtopic,
    addQuestion,
    deleteQuestion,
    reorderTopics,
    reorderSubtopics,
    editTopic,
    editSubtopic,
    editQuestion,
    setTopics,
  } = useSheetStore();

  const [newTopic, setNewTopic] = useState("");
  const [inputs, setInputs] = useState({});
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [questionInput, setQuestionInput] = useState("");



  useEffect(() => {
  async function fetchData() {
    try {
      const response = await fetch(
        "https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet"
      );

      const result = await response.json();
      const questions = result.data.questions;

      const grouped = {};

      questions.forEach((q) => {
        const topicName = q.topic || "General";

        if (!grouped[topicName]) {
          grouped[topicName] = [];
        }

        grouped[topicName].push({
          id: q._id || Math.random(),
          title: q.questionTitle || q.title || "Untitled",
        });
      });

      const formattedTopics = Object.keys(grouped).map(
        (topicName) => ({
          id: topicName,
          title: topicName,
          subtopics: [
            {
              id: topicName + "-sub",
              title: "Questions",
              questions: grouped[topicName],
            },
          ],
        })
      );

      setTopics(formattedTopics);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (topics.length === 0) {
    fetchData();
  } else {
    setLoading(false);
  }
}, [topics.length, setTopics]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading sheet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-10">
  <div className="max-w-4xl mx-auto">

      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
  📋 Question Management Sheet
</h1>


      {/* Add Topic */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter topic name"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={() => {
            if (!newTopic) return;
            addTopic(newTopic);
            setNewTopic("");
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Topic
        </button>
      </div>

      {/* TOPIC DRAG */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) return;

          if (active.id !== over.id) {
            const oldIndex = topics.findIndex(
              (t) => t.id === active.id
            );
            const newIndex = topics.findIndex(
              (t) => t.id === over.id
            );

            reorderTopics(
              arrayMove(topics, oldIndex, newIndex)
            );
          }
        }}
      >
        <SortableContext
          items={topics.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {topics.map((topic) => (
            <SortableTopic key={topic.id} topic={topic}>
              <div className={`p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-5 border ${
  expanded[topic.id]
    ? "bg-blue-50 border-blue-200"
    : "bg-white border-gray-100"
}`}
>
                {/* Topic Title */}
                <div className="flex justify-between mb-3">
                  {editing[topic.id] ? (
                    <input
                      type="text"
                      defaultValue={topic.title}
                      onBlur={(e) => {
                        editTopic(topic.id, e.target.value);
                        setEditing({
                          ...editing,
                          [topic.id]: false,
                        });
                      }}
                      autoFocus
                      className="border p-1 rounded"
                    />
                  ) : (
                    <div
  className="flex items-center gap-2 cursor-pointer"
  onClick={() =>
    setExpanded({
      ...expanded,
      [topic.id]: !expanded[topic.id],
    })
  }
>
  <span className="text-blue-500 font-semibold">
  {expanded[topic.id] ? "▼" : "▶"}
</span>


  {editing[topic.id] ? (
    <input
      type="text"
      defaultValue={topic.title}
      onBlur={(e) => {
        editTopic(topic.id, e.target.value);
        setEditing({
          ...editing,
          [topic.id]: false,
        });
      }}
      autoFocus
      className="border p-1 rounded"
    />
  ) : (
    <h2 className="font-semibold">
      {topic.title}
    </h2>
  )}
</div>

                  )}

                  <button
                    onClick={() =>
                      deleteTopic(topic.id)
                    }
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>

                {/* Add Subtopic */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add subtopic"
                    value={inputs[topic.id] || ""}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        [topic.id]: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-64"
                  />
                  <button
                    onClick={() => {
                      if (!inputs[topic.id]) return;
                      addSubtopic(
                        topic.id,
                        inputs[topic.id]
                      );
                      setInputs({
                        ...inputs,
                        [topic.id]: "",
                      });
                    }}
                    className="bg-green-500 text-white px-3 py-2 rounded"
                  >
                    Add
                  </button>
                </div>

                {/* SUBTOPIC DRAG */}
                {expanded[topic.id] && (
  <>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (!over) return;

                    if (active.id !== over.id) {
                      const oldIndex =
                        topic.subtopics.findIndex(
                          (s) => s.id === active.id
                        );
                      const newIndex =
                        topic.subtopics.findIndex(
                          (s) => s.id === over.id
                        );

                      reorderSubtopics(
                        topic.id,
                        arrayMove(
                          topic.subtopics,
                          oldIndex,
                          newIndex
                        )
                      );
                    }
                  }}
                >
                  <SortableContext
                    items={topic.subtopics.map(
                      (s) => s.id
                    )}
                    strategy={
                      verticalListSortingStrategy
                    }
                  >
                    {topic.subtopics.map((sub) => (
                      <SortableSubtopic
                        key={sub.id}
                        sub={sub}
                      >
                        <div className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200 transition-all duration-300">



                          {/* Subtopic Title */}
                          <div className="flex justify-between mb-2">
                            {editing[sub.id] ? (
                              <input
                                type="text"
                                defaultValue={sub.title}
                                onBlur={(e) => {
                                  editSubtopic(
                                    topic.id,
                                    sub.id,
                                    e.target.value
                                  );
                                  setEditing({
                                    ...editing,
                                    [sub.id]: false,
                                  });
                                }}
                                autoFocus
                                className="border p-1 rounded"
                              />
                            ) : (
                              <div
  className="flex items-center gap-2 cursor-pointer"
  onClick={() =>
    setExpanded({
      ...expanded,
      [sub.id]: !expanded[sub.id],
    })
  }
>
  <span className="text-blue-500 font-semibold">
  {expanded[sub.id] ? "▼" : "▶"}
</span>


  {editing[sub.id] ? (
    <input
      type="text"
      defaultValue={sub.title}
      onBlur={(e) => {
        editSubtopic(
          topic.id,
          sub.id,
          e.target.value
        );
        setEditing({
          ...editing,
          [sub.id]: false,
        });
      }}
      autoFocus
      className="border p-1 rounded"
    />
  ) : (
    <span className="font-medium">
      {sub.title}
    </span>
  )}
</div>

                            )}

                            <button
                              onClick={() =>
                                deleteSubtopic(
                                  topic.id,
                                  sub.id
                                )
                              }
                              className="text-red-400"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Questions */}
                          {/* Add Question Input */}
<div className="flex gap-2 mb-2">
  <input
  type="text"
  placeholder="Add question"
  value={questionInput}
  onChange={(e) => setQuestionInput(e.target.value)}
  className="border p-2 rounded w-64"
/>

  <button
  onClick={() => {
    if (!questionInput.trim()) return;

    if (
      activeEdit &&
      activeEdit.topicId === topic.id &&
      activeEdit.subId === sub.id
    ) {
      editQuestion(
        activeEdit.topicId,
        activeEdit.subId,
        activeEdit.questionId,
        questionInput
      );
      setActiveEdit(null);
    } else {
      addQuestion(topic.id, sub.id, questionInput);
    }

    setQuestionInput("");
  }}
  className="bg-purple-500 text-white px-3 py-2 rounded"
>
  {activeEdit &&
  activeEdit.topicId === topic.id &&
  activeEdit.subId === sub.id
    ? "Save"
    : "Add"}
</button>

</div>

                          {expanded[sub.id] && (
  <>
                          {sub.questions.map((q) => (
  <div
    key={q.id}
    className="bg-white p-2 rounded mb-1 flex justify-between text-sm hover:bg-gray-50 transition cursor-pointer"
    onClick={() => {
      setQuestionInput(q.title);
      setActiveEdit({
        topicId: topic.id,
        subId: sub.id,
        questionId: q.id,
      });
    }}
  >
    <span>{q.title}</span>

    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteQuestion(topic.id, sub.id, q.id);
      }}
      className="text-red-400"
    >
      Delete
    </button>
  </div>
))}

                          </>
                          )}
                        </div>
                      </SortableSubtopic>
                    ))}
                  </SortableContext>
                </DndContext>
              </>
            )}
              </div>
            </SortableTopic>
          ))}
        </SortableContext>
      </DndContext>
      
    </div>
    </div>
  );
}

export default App;
