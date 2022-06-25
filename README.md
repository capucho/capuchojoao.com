# capuchojoao.com

Personal blog, where I write things that might help someone else on their jorney :)


FIX:

https://stackoverflow.com/questions/23463679/s3-static-pages-without-html-extension


CLI to remove extensions:

for f in *html; do    
    mv -- "$f" "${f%.html}"
done
