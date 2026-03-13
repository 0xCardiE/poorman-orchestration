import type { ChangeEvent, FormEvent } from "react";
import type { TopicFormValues } from "./topicFormUtils";

interface TopicFormProps {
  formValues: TopicFormValues;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValuesChange: (values: TopicFormValues) => void;
}

export function TopicForm({
  formValues,
  isEditing,
  onCancel,
  onSubmit,
  onValuesChange,
}: TopicFormProps) {
  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    onValuesChange({
      ...formValues,
      [name]: value,
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Topic editor</p>
          <h2>{isEditing ? "Edit topic" : "Add topic"}</h2>
        </div>
      </div>

      <form className="source-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            required
            name="name"
            value={formValues.name}
            onChange={handleFieldChange}
            placeholder="Video Analysis Workflows"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            value={formValues.description}
            onChange={handleFieldChange}
            placeholder="Describe what belongs in this topic and how it should be used."
          />
        </label>

        <label className="field">
          <span>Tags</span>
          <input
            name="tagsText"
            value={formValues.tagsText}
            onChange={handleFieldChange}
            placeholder="workflow, analysis, review"
          />
        </label>

        <label className="field">
          <span>Open questions</span>
          <textarea
            name="questionPromptsText"
            rows={5}
            value={formValues.questionPromptsText}
            onChange={handleFieldChange}
            placeholder="One question per line"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {isEditing ? "Save changes" : "Create topic"}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
