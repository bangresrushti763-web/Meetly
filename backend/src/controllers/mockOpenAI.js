// Mock OpenAI API for testing purposes
export const mockOpenAI = {
  chat: {
    completions: {
      create: async (params) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return a mock summary based on the input
        const transcript = params.messages.find(msg => msg.role === 'user')?.content || '';
        
        // Extract meeting topic from transcript (simplified)
        const topic = transcript.substring(0, 50) + '...';
        
        return {
          choices: [{
            message: {
              content: `This is a mock summary of the meeting about "${topic}".

Key points discussed:
- Point 1
- Point 2
- Point 3

Action items:
- Follow up on item 1
- Complete task 2 by EOD`
            }
          }]
        };
      }
    }
  }
};