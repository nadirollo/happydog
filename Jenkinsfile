node {
   // Mark the code checkout 'stage'....
   stage 'Checkout'

   // Get some code from a GitHub repository
   git url: 'https://github.com/nadirollo/happydog'

   // Use venv for the project
   def venv = '/Users/nadir/workspace/happydog/venv'

   // Linting
   stage 'Linter'
   sh "${venv}/bin/django-lint happy"
   sh "${venv}/bin/django-lint happydog"
}
