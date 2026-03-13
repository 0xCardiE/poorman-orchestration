import type { ChangeEvent, FormEvent } from "react";
import type { ClaimRelationship } from "../../types/claim";
import type { SourceRecord } from "../../types/source";
import type { TopicRecord } from "../../types/topic";
import type { ClaimFormValues } from "./claimUtils";
import {
  getClaimRelationshipValue,
  setClaimRelationship,
} from "./claimUtils";

const relationshipOptions: Array<ClaimRelationship | "none"> = [
  "none",
  "support",
  "contradict",
  "neutral",
];

interface ClaimFormOption {
  id: string;
  text: string;
}

interface ClaimFormProps {
  formValues: ClaimFormValues;
  isEditing: boolean;
  topics: TopicRecord[];
  sources: SourceRecord[];
  relatedClaimOptions: ClaimFormOption[];
  validationMessage: string | null;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onValuesChange: (values: ClaimFormValues) => void;
}

export function ClaimForm({
  formValues,
  isEditing,
  topics,
  sources,
  relatedClaimOptions,
  validationMessage,
  onCancel,
  onSubmit,
  onValuesChange,
}: ClaimFormProps) {
  function handleFieldChange(
    event: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    onValuesChange({
      ...formValues,
      [name]: value,
    });
  }

  function handleSourceToggle(sourceId: string) {
    const sourceIds = formValues.sourceIds.includes(sourceId)
      ? formValues.sourceIds.filter((id) => id !== sourceId)
      : [...formValues.sourceIds, sourceId];

    onValuesChange({
      ...formValues,
      sourceIds,
    });
  }

  function handleRelationshipChange(
    relatedClaimId: string,
    relationship: ClaimRelationship | "none",
  ) {
    onValuesChange({
      ...formValues,
      relatedClaims: setClaimRelationship(
        formValues.relatedClaims,
        relatedClaimId,
        relationship,
      ),
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Claim editor</p>
          <h2>{isEditing ? "Edit claim" : "Add claim"}</h2>
        </div>
      </div>

      <form className="source-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Claim</span>
          <textarea
            required
            name="text"
            rows={3}
            value={formValues.text}
            onChange={handleFieldChange}
            placeholder="Manual summaries are easier to trust when each claim cites a source."
          />
        </label>

        <label className="field">
          <span>Topic</span>
          <select
            required
            name="topicId"
            value={formValues.topicId}
            onChange={handleFieldChange}
          >
            <option value="" disabled>
              Select a topic
            </option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="field-group">
          <legend>Linked sources</legend>
          <p className="field-hint">Select one or more sources that support this claim.</p>
          <div className="checkbox-grid">
            {sources.map((source) => (
              <label key={source.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formValues.sourceIds.includes(source.id)}
                  onChange={() => handleSourceToggle(source.id)}
                />
                <span>{source.title}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Notes</span>
          <textarea
            name="notes"
            rows={4}
            value={formValues.notes}
            onChange={handleFieldChange}
            placeholder="Explain why the linked sources are relevant or where evidence is still thin."
          />
        </label>

        <fieldset className="field-group">
          <legend>Related claims</legend>
          {relatedClaimOptions.length > 0 ? (
            <div className="relationship-list">
              {relatedClaimOptions.map((claim) => (
                <label key={claim.id} className="relationship-row">
                  <span>{claim.text}</span>
                  <select
                    value={getClaimRelationshipValue(formValues.relatedClaims, claim.id)}
                    onChange={(event) =>
                      handleRelationshipChange(
                        claim.id,
                        event.target.value as ClaimRelationship | "none",
                      )
                    }
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "none" ? "No link" : option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : (
            <p className="field-hint">Create another claim to start adding relationships.</p>
          )}
        </fieldset>

        {validationMessage ? (
          <p className="form-message">{validationMessage}</p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {isEditing ? "Save changes" : "Create claim"}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
