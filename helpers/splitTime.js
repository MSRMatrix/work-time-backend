export function splitTime(result, user, timelog) {

    if(!result){
      return;
    }
    const userHours = user.totalHours.split(" ");
    const timelogHours = timelog.actualTime.split(" ");
  
    let totalStart = parseFloat(userHours[0]) + result.first;
    let totalEnd = parseFloat(userHours[1]) + result.end;
  
    let actualStart = parseFloat(timelogHours[0]) + result.first;
    let actualEnd = parseFloat(timelogHours[1]) + result.end;
  
    if (totalEnd > 60) {
      totalStart += Math.floor(totalEnd / 60);
      totalEnd = totalEnd % 60;
    }
  
    if (actualEnd > 60) {
      actualStart += Math.floor(actualEnd / 60);
      actualEnd = actualEnd % 60;
    }
  
    const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`);
    
    const splitResult = {
      total: `${formatTime(totalStart)}S ${formatTime(totalEnd)}M`,
      actual: `${formatTime(actualStart)}S ${formatTime(actualEnd)}M`,
    };
  
    return splitResult;
  }