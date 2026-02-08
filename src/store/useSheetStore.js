import { create } from "zustand";
import { v4 as uuid } from "uuid";

export const useSheetStore = create((set) => ({
  topics: [],

  addTopic: (title) =>
    set((state) => ({
      topics: [
        ...state.topics,
        { id: uuid(), title, subtopics: [] },
      ],
    })),

  deleteTopic: (id) =>
    set((state) => ({
      topics: state.topics.filter((topic) => topic.id !== id),
    })),

  addSubtopic: (topicId, title) =>
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subtopics: [
                ...topic.subtopics,
                { id: uuid(), title, questions: [] },
              ],
            }
          : topic
      ),
    })),

  deleteSubtopic: (topicId, subtopicId) =>
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subtopics: topic.subtopics.filter(
                (sub) => sub.id !== subtopicId
              ),
            }
          : topic
      ),
    })),

  addQuestion: (topicId, subtopicId, title) =>
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subtopics: topic.subtopics.map((sub) =>
                sub.id === subtopicId
                  ? {
                      ...sub,
                      questions: [
                        ...sub.questions,
                        { id: uuid(), title },
                      ],
                    }
                  : sub
              ),
            }
          : topic
      ),
    })),

  deleteQuestion: (topicId, subtopicId, questionId) =>
    set((state) => ({
      topics: state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subtopics: topic.subtopics.map((sub) =>
                sub.id === subtopicId
                  ? {
                      ...sub,
                      questions: sub.questions.filter(
                        (q) => q.id !== questionId
                      ),
                    }
                  : sub
              ),
            }
          : topic
      ),
    })),
    reorderTopics: (newTopics) =>
  set(() => ({
    topics: newTopics,
  })),

  reorderSubtopics: (topicId, newSubtopics) =>
  set((state) => ({
    topics: state.topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, subtopics: newSubtopics }
        : topic
    ),
  })),
  editTopic: (id, newTitle) =>
  set((state) => ({
    topics: state.topics.map((topic) =>
      topic.id === id
        ? { ...topic, title: newTitle }
        : topic
    ),
  })),
  editSubtopic: (topicId, subId, newTitle) =>
  set((state) => ({
    topics: state.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            subtopics: topic.subtopics.map((sub) =>
              sub.id === subId
                ? { ...sub, title: newTitle }
                : sub
            ),
          }
        : topic
    ),
  })),
editQuestion: (topicId, subId, questionId, newTitle) =>
  set((state) => ({
    topics: state.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            subtopics: topic.subtopics.map((sub) =>
              sub.id === subId
                ? {
                    ...sub,
                    questions: sub.questions.map((q) =>
                      q.id === questionId
                        ? { ...q, title: newTitle }
                        : q
                    ),
                  }
                : sub
            ),
          }
        : topic
    ),
  })),
  setTopics: (topics) =>
  set(() => ({
    topics,
  })),

}));
