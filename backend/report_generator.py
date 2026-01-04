import pandas as pd
from companies import COMPANY_KNOWLEDGE_BASE, DEFAULT_RECOMMENDATIONS

def generate_company_report(user_skills, matches, dataset_df=None):
    """
    Generates a markdown report for company recommendations.
    
    user_skills: list of strings
    matches: list of dicts (from matcher.match_jobs)
    dataset_df: pandas DataFrame (optional, to lookup specific dataset companies)
    """
    
    # 1. Top Skills
    top_skills_str = ", ".join(user_skills[:5])
    
    report_lines = []
    report_lines.append(f"**Top Skills:**\n- {top_skills_str}\n")
    
    # 2. Top Matches Summary
    report_lines.append("**Top Matching Job Roles:**")
    top_3_matches = matches[:3]
    for match in top_3_matches:
        report_lines.append(f"- {match['job_role']} → {match['match_score']}%")
    report_lines.append("") # Newline
    
    # 3. Company Recommendations
    report_lines.append("**Company Recommendations Based on Your Skills:**\n")
    
    for idx, match in enumerate(top_3_matches, 1):
        role = match['job_role']
        score = match['match_score']
        
        # Get Knowledge Base Data
        kb_data = COMPANY_KNOWLEDGE_BASE.get(role, DEFAULT_RECOMMENDATIONS)
        
        # Merge with Dataset Companies if available
        # Find companies in dataset that have this role
        dataset_companies = []
        if dataset_df is not None and not dataset_df.empty:
            relevant_rows = dataset_df[dataset_df['job_role'].str.contains(role, case=False, na=False)]
            dataset_companies = relevant_rows['company'].dropna().unique().tolist()
        
        # Combine lists (Prioritize dataset, then KB)
        all_companies = list(set(dataset_companies + kb_data['top_companies']))
        recommended_companies = all_companies[:5] # Take top 5
        
        report_lines.append(f"{idx}. ⭐ {role} ({score}% match)")
        report_lines.append("   Recommended Companies:")
        
        for company in recommended_companies:
            # Add simple annotations based on generic knowledge or location if we had it
            # For now, just listing them as requested in updated prompt format
            report_lines.append(f"   - {company}")
            
        report_lines.append("")
        
    # 4. Why Recommendations
    report_lines.append("**Why These Companies Were Recommended:**")
    # Collect reasons from top match
    prime_role = top_3_matches[0]['job_role']
    prime_reasons = COMPANY_KNOWLEDGE_BASE.get(prime_role, DEFAULT_RECOMMENDATIONS)['reasons']
    
    for reason in prime_reasons:
        report_lines.append(f"- {reason}")
    report_lines.append("- Companies align with your identified skill strengths")
    report_lines.append("- Roles maximize your hiring probability based on current market trends\n")

    # 5. Action Plan
    report_lines.append("**Action Plan:**")
    report_lines.append("- Build 1-2 projects aligned with **" + top_3_matches[0]['job_role'] + "**")
    report_lines.append("- Optimize resume keyword section for ATS using: " + ", ".join(match['missing_skills'][:3]))
    report_lines.append("- Start applying to entry-level / internship listings on company websites")
    
    return "\n".join(report_lines)
