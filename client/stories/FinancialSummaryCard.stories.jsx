import React from 'react';
import FinancialSummaryCard from '../components/FinancialSummaryCard/FinancialSummaryCard';

export default {
  title: 'Components/FinancialSummaryCard',
  component: FinancialSummaryCard,
  argTypes: {
    summaryText: { control: 'text' },
  },
};

const Template = (args) => <FinancialSummaryCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  summaryText: 'This is the default summary text.',
};

export const AiIdeaLab = (args) => {
  const [summaryText, setSummaryText] = React.useState(args.summaryText);

  return (
    <div>
      <h2>AI Idea Lab</h2>
      <textarea
        rows="10"
        cols="50"
        onChange={(e) => setSummaryText(e.target.value)}
        placeholder="Paste AI Studio Output Here"
      />
      <hr />
      <FinancialSummaryCard summaryText={summaryText} />
    </div>
  );
};
AiIdeaLab.args = {
  summaryText: 'Initial text from AI Idea Lab',
};
