import type { ChangeEvent, FormEvent } from "react";
import type { TopicRecord } from "../../types/topic";
import type { SourceType } from "../../types/source";
import type { SourceFormValues } from "./sourceUtils";

const sourceTypeOptions: SourceType[] = ["article", "paper", "report", "note"];

interface SourceFormProps {
  formValues: SourceFormValues;
  isEditing: boolean;
  topics: TopicRecord[];
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValuesChange: (values: SourceFormValues) => void;
}

export function SourceForm({
  formValues,
  isEditing,
  topics,
  onCancel,
  onSubmit,
  onValuesChange,
}: SourceFormProps) {
  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    onValuesChange({
      ...formValues,
      [name]: value,
    });
  }

  function handleTopicToggle(topicId: string) {
    const topicIds = formValues.topicIds.includes(topicId)
      ? formValues.topicIds.filter((id) => id !== topicId)
      : [...formValues.topicIds, topicId];

    onValuesChange({
      ...formValues,
      topicIds,
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Source editor</p>
          <h2>{isEditing ? "Edit source" : "Add source"}</h2>
        </div>
      </div>

      <form className="source-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            required
            name="title"
            value={formValues.title}
            onChange={handleFieldChange}
            placeholder="Post-match review template"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>URL</span>
            <input
              name="url"
              type="url"
              value={formValues.url}
              onChange={handleFieldChange}
              placeholder="https://example.com/source"
            />
          </label>

          <label className="field">
            <span>Type</span>
            <select
              name="type"
              value={formValues.type}
              onChange={handleFieldChange}
            >
              {sourceTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Publisher</span>
            <input
              name="publisher"
              value={formValues.publisher}
              onChange={handleFieldChange}
              placeholder="Analyst Weekly"
            />
          </label>

          <label className="field">
            <span>Date</span>
            <input
              name="publishedAt"
              type="date"
              value={formValues.publishedAt}
              onChange={handleFieldChange}
            />
          </label>
        </div>

        <fieldset className="field-group">
          <legend>Topics</legend>
          <div className="checkbox-grid">
            {topics.map((topic) => (
              <label key={topic.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formValues.topicIds.includes(topic.id)}
                  onChange={() => handleTopicToggle(topic.id)}
                />
                <span>{topic.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Tags</span>
          <input
            name="tagsText"
            value={formValues.tagsText}
            onChange={handleFieldChange}
            placeholder="template, review, workflow"
          />
        </label>

        <label className="field">
          <span>Notes</span>
          <textarea
            name="notes"
            rows={4}
            value={formValues.notes}
            onChange={handleFieldChange}
            placeholder="Capture why this source matters."
          />
        </label>

        <label className="field">
          <span>Manual summary</span>
          <textarea
            name="summary"
            rows={4}
            value={formValues.summary}
            onChange={handleFieldChange}
            placeholder="Summarize the source in your own words."
          />
        </label>

        <label className="field">
          <span>Key takeaways</span>
          <textarea
            name="keyTakeawaysText"
            rows={4}
            value={formValues.keyTakeawaysText}
            onChange={handleFieldChange}
            placeholder="One takeaway per line"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {isEditing ? "Save changes" : "Create source"}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
