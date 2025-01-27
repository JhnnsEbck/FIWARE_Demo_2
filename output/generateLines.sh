while read number; do
  echo "dataController.updateData($number);"
  echo "await new Promise(r => setTimeout(r, 500));"
done < working-diva-numbers.txt