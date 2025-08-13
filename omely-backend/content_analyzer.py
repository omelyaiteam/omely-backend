import json
import re

class ContentAnalyzer:
    def __init__(self):
        self.summary_templates = {
            'key_points': 'Key Points:',
            'main_ideas': 'Main Ideas:',
            'action_items': 'Action Items:'
        }
    
    def analyze_content(self, transcription, video_title):
        """Analyze video content and generate summary only"""
        return {
            'summary': self._generate_summary(transcription, video_title),
            'key_insights': self._extract_key_insights(transcription)
        }
    
    def _generate_summary(self, transcription, video_title):
        """Generate a clean and user-friendly summary"""
        # Extract key sentences and concepts
        sentences = self._split_into_sentences(transcription)
        key_concepts = self._extract_key_concepts(sentences)
        
        summary = f"""
**{video_title}**

**Key Points to Remember:**
{self._format_key_points_clean(key_concepts)}

**Summary:**
{self._create_clean_summary(sentences)}

**Main Insights:**
{self._extract_main_insights_clean(sentences)}

**Recommended Actions:**
{self._generate_action_items_clean(key_concepts)}
        """
        
        return summary.strip()
    
    def _generate_quiz(self, transcription, video_title):
        """Generate quiz questions based on video content"""
        sentences = self._split_into_sentences(transcription)
        key_concepts = self._extract_key_concepts(sentences)
        
        quiz = {
            'title': f'Quiz : {video_title}',
            'questions': []
        }
        
        # Generate questions based on key concepts
        for concept in key_concepts[:5]:  # Top 5 concepts
            question = self._create_question_from_concept(concept, sentences)
            if question:
                quiz['questions'].append(question)
        
        # Add some general comprehension questions
        general_questions = [
            {
                'question': 'Quel est le message principal de cette vidéo ?',
                'options': [
                    'La perfection est nécessaire pour réussir',
                    'La persistance et l\'action constante sont plus importantes que le talent',
                    'L\'intelligence est la clé du succès',
                    'Il faut attendre les bonnes conditions pour agir'
                ],
                'correct': 1,
                'explanation': 'La vidéo met l\'accent sur l\'importance de l\'action constante plutôt que sur la perfection ou le talent.'
            },
            {
                'question': 'Comment la vidéo suggère-t-elle de voir l\'échec ?',
                'options': [
                    'Comme une preuve d\'échec personnel',
                    'Comme un feedback et une opportunité d\'apprentissage',
                    'Comme un signe qu\'il faut abandonner',
                    'Comme quelque chose à éviter à tout prix'
                ],
                'correct': 1,
                'explanation': 'La vidéo encourage à voir l\'échec comme un feedback constructif plutôt qu\'un échec personnel.'
            }
        ]
        
        quiz['questions'].extend(general_questions)
        
        return quiz
    
    def _extract_key_insights(self, transcription):
        """Extract key insights from the transcription"""
        sentences = self._split_into_sentences(transcription)
        
        insights = []
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in ['key', 'important', 'crucial', 'essential', 'main']):
                insights.append(sentence.strip())
        
        return insights[:5]  # Top 5 insights
    
    def _split_into_sentences(self, text):
        """Split text into sentences"""
        return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    
    def _extract_key_concepts(self, sentences):
        """Extract key concepts from sentences"""
        concepts = []
        for sentence in sentences:
            if len(sentence.split()) > 5:  # Meaningful sentences
                concepts.append(sentence)
        return concepts
    
    def _format_key_points(self, concepts):
        """Format key points for summary"""
        points = []
        for i, concept in enumerate(concepts[:5], 1):
            points.append(f"{i}. {concept}")
        return '\n'.join(points)
    
    def _format_key_points_clean(self, concepts):
        """Format key points in a clean way"""
        points = []
        for i, concept in enumerate(concepts[:3], 1):  # Only top 3
            points.append(f"• {concept}")
        return '\n'.join(points)
    
    def _create_executive_summary(self, sentences):
        """Create an executive summary"""
        if len(sentences) >= 3:
            return sentences[0] + " " + sentences[1] + " " + sentences[2]
        return sentences[0] if sentences else "Aucun contenu disponible."
    
    def _create_clean_summary(self, sentences):
        """Create a clean and concise summary"""
        if len(sentences) >= 2:
            return sentences[0] + " " + sentences[1]
        return sentences[0] if sentences else "No content available."
    
    def _extract_main_insights(self, sentences):
        """Extract main insights"""
        insights = []
        for sentence in sentences:
            if any(word in sentence.lower() for word in ['learned', 'realized', 'understood', 'discovered']):
                insights.append(f"- {sentence}")
        return '\n'.join(insights[:3])
    
    def _extract_main_insights_clean(self, sentences):
        """Extract main insights in a clean way"""
        insights = []
        for sentence in sentences:
            if any(word in sentence.lower() for word in ['learned', 'realized', 'understood', 'discovered']):
                insights.append(f"• {sentence}")
        return '\n'.join(insights[:2])  # Only top 2
    
    def _generate_action_items(self, concepts):
        """Generate actionable items"""
        actions = [
            "- Start with small daily actions",
            "- View failure as constructive feedback",
            "- Focus on progress rather than perfection",
            "- Develop consistent habits"
        ]
        return '\n'.join(actions)
    
    def _generate_action_items_clean(self, concepts):
        """Generate actionable items in a clean way"""
        actions = [
            "• Start with small daily actions",
            "• View failure as constructive feedback",
            "• Focus on progress rather than perfection"
        ]
        return '\n'.join(actions)
    
    def _create_question_from_concept(self, concept, sentences):
        """Create a quiz question from a concept"""
        # This is a simplified version - in a real implementation,
        # you'd use NLP to generate better questions
        return {
            'question': f'Qu\'est-ce que la vidéo dit à propos de : "{concept[:50]}..." ?',
            'options': [
                'C\'est important pour le succès',
                'C\'est sans importance',
                'C\'est controversé',
                'C\'est temporaire'
            ],
            'correct': 0,
            'explanation': f'La vidéo présente ce concept comme important pour le développement personnel.'
        }
