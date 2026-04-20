/**
 * Pure function to generate explanation based on computed scores and deterministic rules.
 */
export const generateExplanation = ({ score, technicalScore, sentimentScore, riskAdjustment, decision }) => {
  let explanation = '';

  // Base explanation based on decision and score
  if (score >= 80) {
    explanation = 'Momentum is strong with supportive technical indicators. Current market conditions favour entry.';
  } else if (score >= 65 && score < 80) {
    explanation = 'Indicators remain positive with acceptable risk. The stock currently aligns with your profile.';
  } else if (score >= 45 && score < 65) {
    explanation = 'Signals are mixed at current levels. Waiting for stronger confirmation may be safer.';
  } else {
    explanation = 'Current indicators show weakness or elevated risk. Existing exposure should be reviewed carefully.';
  }

  // Modifiers
  if (sentimentScore > 0) {
    explanation += ' Recent news flow remains supportive.';
  } else if (sentimentScore < 0) {
    explanation += ' Recent headlines suggest caution.';
  }

  if (riskAdjustment < 0) {
    explanation += ' Risk profile reduces attractiveness for this position.';
  }

  return explanation;
};
