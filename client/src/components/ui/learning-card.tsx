import { useState, useEffect, type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LearningCard as LearningCardType } from "@/types";
import { speakCard, stopSpeech, isSpeaking } from "@/lib/text-to-speech";

interface LearningCardProps {
  card: LearningCardType;
}

export const LearningCard: FC<LearningCardProps> = ({ card }) => {
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  
  // Update speaking status
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      setIsSpeakingNow(isSpeaking());
    }, 300);
    
    return () => {
      clearInterval(checkSpeakingInterval);
    };
  }, []);
  
  // Handle read aloud button click
  const handleReadAloud = () => {
    if (isSpeakingNow) {
      stopSpeech();
      return;
    }
    
    speakCard(card.title, card.content);
  };
  
  return (
    <div className="card-container w-full max-w-3xl flex-1 flex items-center justify-center my-4">
      <Card className="card bg-white rounded-2xl shadow-lg w-full max-w-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">{card.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 flex items-center"
              onClick={handleReadAloud}
            >
              <i className={`${isSpeakingNow ? 'ri-stop-circle-line' : 'ri-volume-up-line'} mr-1`}></i>
              {isSpeakingNow ? 'Stop' : 'Read'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: card.content }} />
          
          <div className="fun-fact bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-amber-500 font-bold mb-1">Fun Fact!</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-amber-500 hover:bg-amber-100 h-7 px-2"
                onClick={() => {
                  if (isSpeakingNow) {
                    stopSpeech();
                  } else {
                    speakCard("Fun Fact", card.funFact);
                  }
                }}
              >
                <i className={`${isSpeakingNow ? 'ri-stop-circle-line' : 'ri-volume-up-line'} mr-1`}></i>
                {isSpeakingNow ? 'Stop' : 'Read'}
              </Button>
            </div>
            <p className="text-neutral-800">{card.funFact}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningCard;
