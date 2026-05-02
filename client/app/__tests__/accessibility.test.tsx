import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Home from '../page';

describe('Accessibility Tests', () => {
  it('should not have any accessibility violations on the main page', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
