import React from 'react';
import { Card } from '@/components/shadcn/card'
import ScoreIndicator  from '@/components/ui/score-indicator'

const Style = {
  InternalCard: " space-y-4 px-8 py-4 ",
  Heading: 'text-secondary-foreground '
}


export const TitledCard = ({title, score, children}) => {

  return (
    <Card className={Style.InternalCard}>
      <div className='flex justify-between items-center'> 
      <h2 className={Style.Heading}> { title }</h2>
      {
      <ScoreIndicator score={score} />    
      }

      </div>
    
      {children}
      </Card>
  );
}

