const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function parseRFPFromNaturalLanguage(naturalLanguageInput) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert procurement assistant. Parse the user's natural language description into a structured RFP. 
            Return ONLY valid JSON with this exact structure:
            {
              "title": "Brief descriptive title",
              "description": "Full description of what needs to be procured",
              "budget": number (extract numerical value only),
              "deliveryTimeline": "timeline string",
              "items": [{"name": "item name", "quantity": number, "specifications": "specs"}],
              "paymentTerms": "payment terms",
              "warrantyRequirements": "warranty info",
              "additionalRequirements": "any other requirements"
            }`
        },
        {
          role: "user",
          content: naturalLanguageInput
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function parseVendorProposal(emailContent, rfpDetails) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured data from vendor proposals. 
            Parse the vendor's email response and extract pricing, terms, and other details.
            Return ONLY valid JSON with this structure:
            {
              "totalPrice": number,
              "breakdown": [{"item": "name", "unitPrice": number, "quantity": number, "totalPrice": number}],
              "deliveryTimeline": "timeline",
              "paymentTerms": "terms",
              "warranty": "warranty info",
              "additionalTerms": "other terms or conditions"
            }`
        },
        {
          role: "user",
          content: `RFP Context: ${JSON.stringify(rfpDetails)}\n\nVendor Response:\n${emailContent}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    console.error('Proposal parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function analyzeProposals(rfp, proposals) {
  try {
    if (!Array.isArray(proposals)) {
      if (!proposals) {
        return { success: false, error: 'No proposals provided' };
      }
      proposals = [proposals];
    }

    const proposalSummaries = proposals.map((p) => ({
      vendor:
        (p.vendorId && (p.vendorId.name || p.vendorId)) ||
        (p.vendor && (p.vendor.name || p.vendor)) ||
        'Unknown Vendor',
      totalPrice: p.parsedData?.totalPrice ?? 'N/A',
      deliveryTimeline: p.parsedData?.deliveryTimeline ?? 'N/A',
      paymentTerms: p.parsedData?.paymentTerms ?? 'N/A',
      warranty: p.parsedData?.warranty ?? 'N/A'
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a procurement expert analyzing vendor proposals. 
            Provide a comprehensive comparison and recommendation.
            Return ONLY valid JSON with this structure:
            {
              "overallRecommendation": "Which vendor to choose and why",
              "comparisonSummary": "Brief comparison of all vendors",
              "vendorAnalyses": [
                {
                  "vendorName": "name",
                  "score": number (0-100),
                  "strengths": ["strength1", "strength2"],
                  "weaknesses": ["weakness1", "weakness2"],
                  "summary": "brief summary"
                }
              ],
              "keyConsiderations": ["consideration1", "consideration2"]
            }`
        },
        {
          role: 'user',
          content: `RFP Details: ${JSON.stringify(rfp)}\n\nProposals: ${JSON.stringify(
            proposalSummaries
          )}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


async function analyzeIndividualProposal(proposal, rfp) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Analyze this vendor proposal against the RFP requirements.
            Return ONLY valid JSON:
            {
              "score": number (0-100),
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"],
              "summary": "brief summary",
              "recommendation": "recommendation text"
            }`
        },
        {
          role: "user",
          content: `RFP: ${JSON.stringify(rfp)}\n\nProposal: ${JSON.stringify(proposal.parsedData)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Individual analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  parseRFPFromNaturalLanguage,
  parseVendorProposal,
  analyzeProposals,
  analyzeIndividualProposal
};
